import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const SENSITIVE_KEYS = [
  "adminPasswordHash",
  "adminUsername",
  "passwordResetCode",
  "passwordResetExpiry",
];

export async function GET() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const settings = await prisma.setting.findMany();
    const settingsObject: Record<string, string> = {};
    settings.forEach((setting) => {
      if (!SENSITIVE_KEYS.includes(setting.key)) {
        settingsObject[setting.key] = setting.value;
      }
    });
    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    const body = await request.json();
    const updates = Object.entries(body);

    const prisma = getPrisma();
    for (const [key, value] of updates) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
