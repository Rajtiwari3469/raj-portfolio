import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Set it in your Vercel project settings."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Lazy getter: defers creation until first actual use at runtime,
// so build-time static analysis won't crash when DATABASE_URL is absent.
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Keep backward-compatible export
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  has(_target, prop) {
    const client = getPrisma();
    return Reflect.has(client, prop);
  },
  ownKeys() {
    const client = getPrisma();
    return Reflect.ownKeys(client);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const client = getPrisma();
    return Reflect.getOwnPropertyDescriptor(client, prop);
  },
});
