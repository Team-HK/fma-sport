import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * On serverless every warm instance opens its own pool; Prisma's default pool
 * size (cpus * 2 + 1) quickly exhausts the database's connection slots under
 * crawler traffic. Cap each instance at one connection unless the URL already
 * sets a limit or points at an external pooler (pgbouncer).
 */
function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !process.env.VERCEL) return url;
  if (/connection_limit=|pgbouncer=true/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=1&pool_timeout=30`;
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
