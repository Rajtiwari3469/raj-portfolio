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
    ssl: { rejectUnauthorized: false },
    max: 3,
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


