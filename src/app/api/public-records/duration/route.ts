import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, duration } = body;

    if (!sessionId || !duration) {
      return NextResponse.json({ error: "sessionId and duration required" }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.publicRecord.updateMany({
      where: {
        sessionId,
        visitDuration: null,
      },
      data: {
        visitDuration: duration,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update duration error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
