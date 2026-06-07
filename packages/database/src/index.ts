import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDatabaseUrl(url?: string): string {
  const resolved = url ?? process.env.DATABASE_URL ?? "";
  if (!resolved) return resolved;
  if (resolved.includes("pgbouncer=true")) return resolved;
  const sep = resolved.includes("?") ? "&" : "?";
  return `${resolved}${sep}pgbouncer=true&connection_limit=1`;
}

export function createPrismaAdapter(connectionString?: string) {
  return new PrismaPg({ connectionString: resolveDatabaseUrl(connectionString) });
}

export function createPrismaClient(connectionString?: string): PrismaClient {
  return new PrismaClient({ adapter: createPrismaAdapter(connectionString) });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from "./generated/prisma/client";
