import { randomBytes } from "node:crypto";
import { and, eq, gt, inArray, lt, lte, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { orders, recoveryLimits, reportAccess } from "@/db/schema";
import { orderSchema, REPORT_PRICE, REPORT_TOPIC, type Chart, type Order } from "@/lib/contracts";
import { interpret } from "./interpretation";
import { sign } from "./tokens";

export const RETENTION_MS = 30 * 24 * 60 * 60_000;
const MAX_ATTEMPTS = 3;
const LEASE_MS = 20_000;
const REFUND_DELAY_MS = 2_000;
const refundable = ["queued", "generating", "failed", "ready"] as const;

type Database = Awaited<ReturnType<typeof getDatabase>>;
type Queries = Pick<Database, "select" | "insert" | "update" | "delete">;
type Row = { order: typeof orders.$inferSelect; access: typeof reportAccess.$inferSelect };

function view({ order, access }: Row): Order {
  return orderSchema.parse({
    status: order.status,
    price: order.price,
    report: order.status === "ready" ? access.report : null,
    canRetry: order.status === "failed" && order.attempts < MAX_ATTEMPTS,
  });
}

async function lookup(db: Database, sessionHash: string): Promise<Row | undefined> {
  const [row] = await db.select({ order: orders, access: reportAccess })
    .from(reportAccess).innerJoin(orders, eq(orders.id, reportAccess.orderId))
    .where(and(eq(reportAccess.sessionHash, sessionHash), gt(orders.expiresAt, new Date())));
  return row;
}

export async function purgeExpired() {
  const db = await getDatabase();
  const now = new Date();
  await db.delete(orders).where(lte(orders.expiresAt, now));
}

export async function createOrder(id: string, chart: Chart) {
  const db = await getDatabase();
  await purgeExpired();
  const recoveryCode = (await sign("order-recovery", id)).slice(0, 24);
  const session = await sign("order-session", id);
  const sessionHash = await sign("session-hash", session);
  const recoveryHash = await sign("recovery-hash", recoveryCode);

  await db.transaction(async (tx: Queries) => {
    const [created] = await tx.insert(orders).values({
      id, price: REPORT_PRICE, currency: "KRW", topic: REPORT_TOPIC, status: "queued",
      updatedAt: new Date(), expiresAt: new Date(Date.now() + RETENTION_MS),
    }).onConflictDoNothing().returning();
    if (created) await tx.insert(reportAccess).values({ orderId: id, sessionHash, recoveryHash, snapshot: chart });
  });
  const row = await lookup(db, sessionHash);
  return row && row.order.status !== "deleted" ? { session, recoveryCode, order: view(row) } : null;
}

export async function getOrder(session: string) {
  const row = await lookup(await getDatabase(), await sign("session-hash", session));
  return row ? view(row) : null;
}

export async function restoreOrder(code: string) {
  const db = await getDatabase();
  const window = Math.floor(Date.now() / 600_000);
  await db.delete(recoveryLimits).where(lt(recoveryLimits.window, window - 1));
  const [limit] = await db.insert(recoveryLimits).values({ window, attempts: 1 })
    .onConflictDoUpdate({
      target: recoveryLimits.window,
      set: { attempts: sql`${recoveryLimits.attempts} + 1` },
      setWhere: lt(recoveryLimits.attempts, 40),
    }).returning();
  if (!limit) return { kind: "limited" } as const;
  const recoveryHash = await sign("recovery-hash", code);
  const session = randomBytes(32).toString("base64url");
  const sessionHash = await sign("session-hash", session);
  const activeIds = db.select({ id: orders.id }).from(orders)
    .where(and(gt(orders.expiresAt, new Date()), inArray(orders.status, [...refundable, "refund_pending", "refunded"])));
  const [access] = await db.update(reportAccess).set({ sessionHash })
    .where(and(eq(reportAccess.recoveryHash, recoveryHash), inArray(reportAccess.orderId, activeIds))).returning();
  const row = access && await lookup(db, sessionHash);
  return row ? { kind: "restored", session, order: view(row) } as const : { kind: "missing" } as const;
}

export async function advanceOrder(session: string, retry: boolean) {
  const db = await getDatabase();
  const sessionHash = await sign("session-hash", session);
  const original = await lookup(db, sessionHash);
  if (!original) return null;
  const { order, access } = original;
  const now = new Date();
  const deadline = new Date(now.getTime() - LEASE_MS);
  const identity = and(eq(orders.id, order.id), eq(orders.status, order.status), eq(orders.attempts, order.attempts));
  if (order.status === "refund_pending") {
    await db.update(orders).set({ status: "refunded", updatedAt: now })
      .where(and(identity, lte(orders.updatedAt, new Date(now.getTime() - REFUND_DELAY_MS))));
  } else if (access.snapshot && (order.status === "queued" || (retry && order.status === "failed") ||
    (order.status === "generating" && order.updatedAt <= deadline))) {
    if (order.attempts >= MAX_ATTEMPTS) {
      await db.update(orders).set({ status: "failed", updatedAt: now }).where(identity);
    } else {
      const attempt = order.attempts + 1;
      const [claimed] = await db.update(orders).set({ status: "generating", attempts: attempt, updatedAt: now })
        .where(identity).returning();
      if (claimed) {
        const sameAttempt = and(eq(orders.id, order.id), eq(orders.status, "generating"), eq(orders.attempts, attempt));
        try {
          if (process.env.SAJU_SIMULATE_FAILURE === "1" && attempt === 1) throw new Error("Mock generation failure");
          const report = interpret(access.snapshot, REPORT_TOPIC);
          await db.transaction(async (tx: Queries) => {
            const [published] = await tx.update(orders).set({ status: "ready", updatedAt: new Date() })
              .where(sameAttempt).returning();
            if (published) await tx.update(reportAccess).set({ report, snapshot: null })
              .where(eq(reportAccess.orderId, published.id));
          });
        } catch {
          await db.update(orders).set({ status: "failed", updatedAt: new Date() }).where(sameAttempt);
        }
      }
    }
  }
  return getOrder(session);
}

export async function refundOrder(session: string) {
  const db = await getDatabase();
  const sessionHash = await sign("session-hash", session);
  const active = db.select({ id: reportAccess.orderId }).from(reportAccess).where(eq(reportAccess.sessionHash, sessionHash));
  await db.transaction(async (tx: Queries) => {
    const [pending] = await tx.update(orders).set({ status: "refund_pending", updatedAt: new Date() })
      .where(and(inArray(orders.id, active), inArray(orders.status, refundable), gt(orders.expiresAt, new Date())))
      .returning();
    if (pending) await tx.update(reportAccess).set({ snapshot: null, report: null })
      .where(eq(reportAccess.orderId, pending.id));
  });
  return getOrder(session);
}

export async function deleteOrder(session: string) {
  const db = await getDatabase();
  const sessionHash = await sign("session-hash", session);
  const active = db.select({ id: reportAccess.orderId }).from(reportAccess).where(eq(reportAccess.sessionHash, sessionHash));
  return db.transaction(async (tx: Queries) => {
    const [deleted] = await tx.update(orders).set({ status: "deleted", updatedAt: new Date() })
      .where(and(inArray(orders.id, active), gt(orders.expiresAt, new Date()))).returning();
    if (deleted) await tx.delete(reportAccess).where(eq(reportAccess.orderId, deleted.id));
    return Boolean(deleted);
  });
}
