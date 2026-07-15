import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    await prisma.chatMessage.updateMany({
      where: { sessionId, sender: "visitor", read: false },
      data: { read: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get admin chat messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: { sessionId, sender: "admin", message },
    });

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error("Send admin chat reply error:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
