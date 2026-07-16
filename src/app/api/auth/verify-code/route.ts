import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const prisma = getPrisma();

    const storedCode = await prisma.setting.findUnique({ where: { key: "passwordResetCode" } });
    const expirySetting = await prisma.setting.findUnique({ where: { key: "passwordResetExpiry" } });

    if (!storedCode?.value || !expirySetting?.value) {
      return NextResponse.json({ error: "No reset code found. Request a new one." }, { status: 400 });
    }

    if (storedCode.value !== code) {
      return NextResponse.json({ error: "Invalid reset code" }, { status: 401 });
    }

    if (new Date() > new Date(expirySetting.value)) {
      return NextResponse.json({ error: "Reset code expired. Request a new one." }, { status: 400 });
    }

    return NextResponse.json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
