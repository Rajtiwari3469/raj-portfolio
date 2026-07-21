import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};

    if (category && category !== "All") {
      where.category = category;
    }

    if (subCategory && subCategory !== "All") {
      where.subCategory = subCategory;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
