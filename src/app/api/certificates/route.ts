import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const certificates = await prisma.certificate.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Get certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
