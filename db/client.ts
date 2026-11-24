import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

export const dataDirectory = resolve(process.env.SAJU_DATA_DIR || ".saju-data");
const state = globalThis as typeof globalThis & { sajuDatabase?: ReturnType<typeof connect> };

async function connect() {
  if (process.env.DATABASE_URL) {
    const [{ Pool }, { drizzle: connectNeon }] = await Promise.all([
      import("@neondatabase/serverless"),
      import("drizzle-orm/neon-serverless"),
    ]);
    return connectNeon(new Pool({ connectionString: process.env.DATABASE_URL }), { schema });
  }
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const database = drizzle(new PGlite(resolve(dataDirectory, "postgres")), { schema });
  await migrate(database, { migrationsFolder: resolve("drizzle") });
  return database;
}

export function getDatabase() {
  return state.sajuDatabase ??= connect().catch((error) => {
    delete state.sajuDatabase;
    throw error;
  });
}
