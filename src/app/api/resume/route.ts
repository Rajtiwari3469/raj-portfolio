import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Get public resumes error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
