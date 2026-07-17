import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECTION_KEYS = [
  "aboutContent",
  "techStack",
  "educationContent",
  "experienceContent",
  "profileImage",
];

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: SECTION_KEYS } },
    });

    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get sections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch section content" },
      { status: 500 }
    );
  }
}
