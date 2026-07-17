import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent, getClientIp } from "@/lib/tracking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, referrer, screenWidth, screenHeight, language, sessionId } = body;

    if (!page) {
      return NextResponse.json({ error: "page is required" }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") || "";
    const ip = getClientIp(request.headers);
    const { browser, os, device, isBot } = parseUserAgent(ua);

    const record = await prisma.publicRecord.create({
      data: {
        page,
        ip,
        userAgent: ua.substring(0, 500),
        browser,
        os,
        device,
        referrer: referrer || null,
        screenWidth: screenWidth || null,
        screenHeight: screenHeight || null,
        language: language || null,
        isBot,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Record visit error:", error);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
