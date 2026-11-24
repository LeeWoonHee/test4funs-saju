import { integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { statuses, type Chart, type Interpretation } from "@/lib/contracts";

export const orderStatus = pgEnum("report_order_status", statuses);
const time = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const orders = pgTable("report_orders", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull(),
  status: orderStatus("status").notNull(),
  attempts: integer("attempts").notNull().default(0),
  updatedAt: time("updated_at").notNull(),
  expiresAt: time("expires_at").notNull(),
});

export const reportAccess = pgTable("report_access", {
  orderId: text("order_id").primaryKey().references(() => orders.id, { onDelete: "cascade" }),
  sessionHash: text("session_hash").notNull(),
  recoveryHash: text("recovery_hash").notNull(),
  snapshot: jsonb("snapshot").$type<Chart>(),
  report: jsonb("report").$type<Interpretation>(),
}, (table) => [
  uniqueIndex("report_session_hash").on(table.sessionHash),
  uniqueIndex("report_recovery_hash").on(table.recoveryHash),
]);

export const recoveryLimits = pgTable("recovery_limits", {
  window: integer("window").primaryKey(),
  attempts: integer("attempts").notNull(),
});
