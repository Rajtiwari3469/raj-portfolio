import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function cleanConnectionString(url: string): string {
  const questionMarkIndex = url.indexOf("?");
  if (questionMarkIndex === -1) return url;

  const base = url.substring(0, questionMarkIndex);
  const params = new URLSearchParams(url.substring(questionMarkIndex + 1));
  params.delete("sslmode");
  const remaining = params.toString();
  return remaining ? `${base}?${remaining}` : base;
}

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Set it in your Vercel project settings."
    );
  }

  const connectionString = cleanConnectionString(rawUrl);

  const pool = new pg.Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

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
