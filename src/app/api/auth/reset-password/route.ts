import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, newPassword, newUsername } = body;

    if (!code) {
      return NextResponse.json({ error: "Reset code is required" }, { status: 400 });
    }

    if (!newPassword && !newUsername) {
      return NextResponse.json({ error: "Provide a new password or new username" }, { status: 400 });
    }

    const prisma = getPrisma();

    const storedCode = await prisma.setting.findUnique({ where: { key: "passwordResetCode" } });
    const expirySetting = await prisma.setting.findUnique({ where: { key: "passwordResetExpiry" } });

    if (!storedCode?.value || !expirySetting?.value) {
      return NextResponse.json({ error: "No reset code found. Please request a new one." }, { status: 400 });
    }

    if (storedCode.value !== code) {
      return NextResponse.json({ error: "Invalid reset code" }, { status: 401 });
    }

    const expiresAt = new Date(expirySetting.value);
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: "Reset code has expired. Please request a new one." }, { status: 400 });
    }

    if (newPassword) {
      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.setting.upsert({
        where: { key: "adminPasswordHash" },
        update: { value: newHash },
        create: { key: "adminPasswordHash", value: newHash },
      });
    }

    if (newUsername) {
      await prisma.setting.upsert({
        where: { key: "adminUsername" },
        update: { value: newUsername },
        create: { key: "adminUsername", value: newUsername },
      });
    }

    await prisma.setting.deleteMany({ where: { key: { in: ["passwordResetCode", "passwordResetExpiry"] } } });

    const messages = [];
    if (newUsername) messages.push("username");
    if (newPassword) messages.push("password");

    return NextResponse.json({ message: `Reset successful! Updated: ${messages.join(" and ")}.` });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }
}
