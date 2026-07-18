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
      where: { sessionId, deleted: false },
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
    const { sessionId, message, messageType } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "admin",
        message,
        messageType: messageType || "text",
      },
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

export async function PUT(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { aiEnabled } = body;

    await prisma.setting.upsert({
      where: { key: "chatAIEnabled" },
      update: { value: String(aiEnabled) },
      create: { key: "chatAIEnabled", value: String(aiEnabled) },
    });

    const statusMessage = aiEnabled
      ? "Raj Sir is not available right now. I am Raj's AI Assistant and I will help you. What's your question?"
      : "Raj Sir is now active! You can continue chatting with him directly.";

    const sessions = await prisma.chatMessage.findMany({
      select: { sessionId: true },
      distinct: ["sessionId"],
    });

    for (const session of sessions) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.sessionId,
          sender: "system",
          message: statusMessage,
          messageType: "text",
        },
      });
    }

    return NextResponse.json({ message: "AI mode updated", aiEnabled });
  } catch (error) {
    console.error("Toggle AI error:", error);
    return NextResponse.json({ error: "Failed to toggle AI" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    await prisma.chatMessage.updateMany({ where: { sessionId }, data: { deleted: true } });

    return NextResponse.json({ message: "Chat session deleted" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
