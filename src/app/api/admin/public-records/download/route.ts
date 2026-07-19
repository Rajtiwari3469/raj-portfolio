import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function escapeCSV(value: string | null): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function recordsToCSV(records: Record<string, unknown>[]): string {
  if (records.length === 0) return "";

  const headers = [
    "Date",
    "Time",
    "Page",
    "IP",
    "Browser",
    "OS",
    "Device",
    "Duration (s)",
    "Type",
    "Language",
    "Screen",
    "Referrer",
    "Session ID",
  ];

  const rows = records.map((r) => {
    const date = new Date(r.createdAt as string);
    return [
      escapeCSV(date.toLocaleDateString("en-IN")),
      escapeCSV(date.toLocaleTimeString("en-IN")),
      escapeCSV(r.page as string),
      escapeCSV(r.ip as string),
      escapeCSV(r.browser as string),
      escapeCSV(r.os as string),
      escapeCSV(r.device as string),
      escapeCSV(String(r.visitDuration ?? "")),
      escapeCSV(r.isBot ? "Bot" : "User"),
      escapeCSV(r.language as string),
      escapeCSV(r.screenWidth && r.screenHeight ? `${r.screenWidth}x${r.screenHeight}` : ""),
      escapeCSV(r.referrer as string),
      escapeCSV(r.sessionId as string),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");
    const format = searchParams.get("format") || "csv";

    const prisma = getPrisma();

    let records;

    if (visitorId) {
      records = await prisma.publicRecord.findMany({
        where: { sessionId: visitorId },
        orderBy: { createdAt: "desc" },
      });

      if (records.length === 0) {
        records = await prisma.publicRecord.findMany({
          where: { ip: visitorId },
          orderBy: { createdAt: "desc" },
        });
      }
    } else {
      records = await prisma.publicRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (format === "json") {
      return NextResponse.json(records);
    }

    const csv = recordsToCSV(records as unknown as Record<string, unknown>[]);
    const fileName = visitorId ? `visitor-${visitorId}-records.csv` : "all-records.csv";

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download records error:", error);
    return NextResponse.json({ error: "Failed to download records" }, { status: 500 });
  }
}
