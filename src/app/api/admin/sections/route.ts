import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const SECTION_KEYS = [
  "aboutContent",
  "techStack",
  "educationContent",
  "experienceContent",
  "profileImage",
];

export async function GET() {
  try {
    const prisma = getPrisma();
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

export async function PUT(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const body = await request.json();
    const entries = Object.entries(body).filter(([key]) =>
      SECTION_KEYS.includes(key)
    );

    for (const [key, value] of entries) {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      await prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    }

    return NextResponse.json({ message: "Sections updated successfully" });
  } catch (error) {
    console.error("Update sections error:", error);
    return NextResponse.json(
      { error: "Failed to update sections" },
      { status: 500 }
    );
  }
}
