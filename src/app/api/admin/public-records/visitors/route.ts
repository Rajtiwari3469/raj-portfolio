import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");

    const prisma = getPrisma();

    if (visitorId) {
      const records = await prisma.publicRecord.findMany({
        where: { sessionId: visitorId },
        orderBy: { createdAt: "desc" },
      });

      if (records.length === 0) {
        const byIp = await prisma.publicRecord.findMany({
          where: { ip: visitorId },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ visitor: visitorId, records: byIp });
      }

      return NextResponse.json({ visitor: visitorId, records });
    }

    const allRecords = await prisma.publicRecord.findMany({
      select: {
        id: true,
        sessionId: true,
        ip: true,
        browser: true,
        os: true,
        device: true,
        page: true,
        isBot: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const visitorMap = new Map<string, {
      visitorId: string;
      label: string;
      records: typeof allRecords;
      lastVisit: string;
      isBot: boolean;
    }>();

    let userCount = 0;
    let botCount = 0;

    for (const record of allRecords) {
      const key = record.sessionId || record.ip || "unknown";
      if (!visitorMap.has(key)) {
        const isBot = record.isBot;
        if (isBot) {
          botCount++;
        } else {
          userCount++;
        }
        visitorMap.set(key, {
          visitorId: key,
          label: isBot ? `Bot ${botCount}` : `User ${userCount}`,
          records: [],
          lastVisit: record.createdAt.toISOString(),
          isBot,
        });
      }
      visitorMap.get(key)!.records.push(record);
    }

    const visitors = Array.from(visitorMap.values()).sort(
      (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );

    return NextResponse.json({
      visitors,
      summary: {
        total: visitors.length,
        users: userCount,
        bots: botCount,
      },
    });
  } catch (error) {
    console.error("Get visitors error:", error);
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 });
  }
}
