import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

function generateResetCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendResetEmail(email: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Portfolio Admin <onboarding@resend.dev>",
      to: email,
      subject: "Portfolio Admin - Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Password Reset Code</h2>
          <p>Your reset code is:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you did not request this, ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send reset email:", error);
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
        error: "Failed to send email. Make sure RESEND_API_KEY is set in Vercel environment variables.",
      }, { status: 500 });
    }

    return NextResponse.json({ message: "Reset code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
