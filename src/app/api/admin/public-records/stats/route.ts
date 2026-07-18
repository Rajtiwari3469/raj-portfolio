import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const prisma = getPrisma();

    const [
      totalRecords,
      recentRecords,
      uniqueIps,
      recentUniqueIps,
      byPage,
      byDevice,
      byBrowser,
      byOs,
      byDay,
      byHour,
      topReferrers,
      botCount,
      recentBotCount,
    ] = await Promise.all([
      prisma.publicRecord.count(),
      prisma.publicRecord.count({ where: { createdAt: { gte: daysAgo } } }),
      prisma.publicRecord.findMany({ select: { ip: true }, distinct: ["ip"] }).then((r: { ip: string | null }[]) => r.length),
      prisma.publicRecord.findMany({ where: { createdAt: { gte: daysAgo } }, select: { ip: true }, distinct: ["ip"] }).then((r: { ip: string | null }[]) => r.length),
      prisma.publicRecord.groupBy({ by: ["page"], _count: true, orderBy: { _count: { page: "desc" } } }),
      prisma.publicRecord.groupBy({ by: ["device"], _count: true, orderBy: { _count: { device: "desc" } } }),
      prisma.publicRecord.groupBy({ by: ["browser"], _count: true, orderBy: { _count: { browser: "desc" } } }),
      prisma.publicRecord.groupBy({ by: ["os"], _count: true, orderBy: { _count: { os: "desc" } } }),
      prisma.$queryRaw`SELECT DATE("createdAt") as date, COUNT(*)::int as count FROM "PublicRecord" WHERE "createdAt" >= ${daysAgo} GROUP BY DATE("createdAt") ORDER BY date ASC`,
      prisma.$queryRaw`SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::int as count FROM "PublicRecord" WHERE "createdAt" >= ${daysAgo} GROUP BY EXTRACT(HOUR FROM "createdAt") ORDER BY hour ASC`,
      prisma.publicRecord.groupBy({ by: ["referrer"], _count: true, where: { referrer: { not: null } }, orderBy: { _count: { referrer: "desc" } }, take: 10 }),
      prisma.publicRecord.count({ where: { isBot: true } }),
      prisma.publicRecord.count({ where: { isBot: true, createdAt: { gte: daysAgo } } }),
    ]);

    const avgPerDay = recentRecords / Math.max(parseInt(period), 1);

    return NextResponse.json({
      total: totalRecords,
      recent: recentRecords,
      uniqueVisitors: uniqueIps,
      recentUniqueVisitors: recentUniqueIps,
      avgPerDay: Math.round(avgPerDay * 10) / 10,
      bots: botCount,
      recentBots: recentBotCount,
      humanVisits: totalRecords - botCount,
      recentHumanVisits: recentRecords - recentBotCount,
      byPage: byPage.map((r: { page: string; _count: number }) => ({ name: r.page, count: r._count })),
      byDevice: byDevice.map((r: { device: string | null; _count: number }) => ({ name: r.device || "Unknown", count: r._count })),
      byBrowser: byBrowser.map((r: { browser: string | null; _count: number }) => ({ name: r.browser || "Unknown", count: r._count })),
      byOs: byOs.map((r: { os: string | null; _count: number }) => ({ name: r.os || "Unknown", count: r._count })),
      byDay: byDay,
      byHour: byHour,
      topReferrers: topReferrers.map((r: { referrer: string | null; _count: number }) => ({ name: r.referrer || "Direct", count: r._count })),
      period: parseInt(period),
    });
  } catch (error) {
    console.error("Get public record stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
