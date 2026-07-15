import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sender, message } = body;

    if (!sessionId || !sender || !message) {
      return NextResponse.json(
        { error: "sessionId, sender, and message are required" },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: { sessionId, sender, message },
    });

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error("Send chat message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get chat messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
