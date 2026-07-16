import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

function generateResetCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendResetEmail(email: string, code: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_ACCESS_KEY || "",
        subject: "Portfolio Admin - Password Reset Code",
        from_name: "Portfolio Admin",
        to: email,
        message: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
      }),
    });
    return response.ok;
  } catch {
    console.error("Failed to send reset email");
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const prisma = getPrisma();

    const emailSetting = await prisma.setting.findUnique({ where: { key: "adminEmail" } });
    const adminEmail = emailSetting?.value || "tiwariraj3469@gmail.com";

    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "This email is not registered as admin" }, { status: 401 });
    }

    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await prisma.setting.upsert({
      where: { key: "passwordResetCode" },
      update: { value: code },
      create: { key: "passwordResetCode", value: code },
    });

    await prisma.setting.upsert({
      where: { key: "passwordResetExpiry" },
      update: { value: expiresAt },
      create: { key: "passwordResetExpiry", value: expiresAt },
    });

    const emailSent = await sendResetEmail(adminEmail, code);

    if (!emailSent) {
      return NextResponse.json({
        message: "Reset code generated. Email could not be sent. Please check server logs.",
        code: code,
      });
    }

    return NextResponse.json({ message: "Reset code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
