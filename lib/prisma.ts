import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * On serverless every warm instance opens its own pool, and concurrent requests
 * spin up many instances at once. Even a small per-instance pool (e.g.
 * connection_limit=5) quickly exhausts the database's connection slots, so on
 * Vercel we force one connection per instance. Skipped when the URL goes
 * through an external pooler (pgbouncer=true), which handles this itself.
 */
function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !process.env.VERCEL || /pgbouncer=true/.test(url)) return url;
  const [base, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  params.set("connection_limit", "1");
  if (!params.has("pool_timeout")) params.set("pool_timeout", "30");
  return `${base}?${params.toString()}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
