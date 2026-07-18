import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const filterPage = searchParams.get("filterPage") || "";
    const filterDevice = searchParams.get("filterDevice") || "";
    const filterBrowser = searchParams.get("filterBrowser") || "";
    const filterOs = searchParams.get("filterOs") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const where: Record<string, unknown> = {};
    if (filterPage) where.page = filterPage;
    if (filterDevice) where.device = filterDevice;
    if (filterBrowser) where.browser = filterBrowser;
    if (filterOs) where.os = filterOs;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const prisma = getPrisma();
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      prisma.publicRecord.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.publicRecord.count({ where }),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get public records error:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    const prisma = getPrisma();

    if (ids) {
      const idArray = ids.split(",");
      await prisma.publicRecord.deleteMany({ where: { id: { in: idArray } } });
      return NextResponse.json({ message: "Records deleted" });
    }

    const all = searchParams.get("all");
    if (all === "true") {
      await prisma.publicRecord.deleteMany();
      return NextResponse.json({ message: "All records deleted" });
    }

    return NextResponse.json({ error: "ids or all=true required" }, { status: 400 });
  } catch (error) {
    console.error("Delete public records error:", error);
    return NextResponse.json({ error: "Failed to delete records" }, { status: 500 });
  }
}
