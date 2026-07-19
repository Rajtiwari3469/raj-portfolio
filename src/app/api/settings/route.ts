import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const SENSITIVE_KEYS = [
  "adminPasswordHash",
  "adminUsername",
  "passwordResetCode",
  "passwordResetExpiry",
];

export async function GET() {
  try {
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
    console.error("Get public settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
