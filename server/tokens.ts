import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { dataDirectory } from "@/db/client";
import { chartSchema, type Chart } from "@/lib/contracts";

const checkoutSchema = z.object({ id: z.uuid(), expires: z.number(), chart: chartSchema });
let secret: Promise<string> | undefined;

async function loadSecret() {
  if (process.env.SAJU_SECRET && Buffer.byteLength(process.env.SAJU_SECRET) >= 32) return process.env.SAJU_SECRET;
  if (process.env.DATABASE_URL || process.env.SAJU_SECRET) throw new Error("SAJU_SECRET must be at least 32 bytes");

  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const filename = join(dataDirectory, "preview-secret");
  const random = randomBytes(32).toString("base64url");
  try {
    await writeFile(filename, random, { flag: "wx", mode: 0o600 });
    return random;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    return readFile(filename, "utf8");
  }
}

export async function sign(scope: string, value: string) {
  secret ??= loadSecret().catch((error) => {
    secret = undefined;
    throw error;
  });
  return createHmac("sha256", await secret).update(scope).update("\0").update(value).digest("base64url");
}

export async function issueCheckout(chart: Chart) {
  const payload = Buffer.from(JSON.stringify({ id: randomUUID(), expires: Date.now() + 30 * 60_000, chart })).toString("base64url");
  return payload + "." + await sign("checkout", payload);
}

export async function verifyCheckout(token: string) {
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length) return null;
  const digest = Buffer.from(await sign("checkout", payload));
  const supplied = Buffer.from(signature);
  if (digest.length !== supplied.length || !timingSafeEqual(digest, supplied)) return null;
  try {
    const parsed = checkoutSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return parsed.expires > Date.now() ? parsed : null;
  } catch {
    return null;
  }
}
