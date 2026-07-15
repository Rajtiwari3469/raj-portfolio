import { NextResponse } from "next/server";

export async function GET() {
  const info: Record<string, unknown> = {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 30) + "..."
      : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const count = await prisma.project.count();
    info.projectCount = count;
    info.status = "ok";
  } catch (error: unknown) {
    info.status = "error";
    info.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(info);
}
