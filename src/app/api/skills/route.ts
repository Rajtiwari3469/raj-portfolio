import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const skills = await prisma.skill.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
