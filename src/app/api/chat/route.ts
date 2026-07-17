import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function generateAIReply(visitorMessage: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return "";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Raj Tiwari's AI assistant on his portfolio website. Be helpful, friendly, and professional. Keep responses concise. If someone asks to talk to Raj directly, say "Raj Sir will be with you shortly!" If they ask about Raj, mention he is a BCA CS & IT Student, Software Developer & AI Technology enthusiast. Never reveal you are an AI. Sign off as "Raj's Assistant" when appropriate. Visitor says: ${visitorMessage}`,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 200 },
        }),
      }
    );

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sender, message, messageType } = body;

    if (!sessionId || !sender || !message) {
      return NextResponse.json(
        { error: "sessionId, sender, and message are required" },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender,
        message,
        messageType: messageType || "text",
      },
    });

    if (sender === "visitor") {
      const aiSetting = await prisma.setting.findUnique({ where: { key: "chatAIEnabled" } });
      const aiEnabled = aiSetting?.value === "true";

      if (aiEnabled) {
        const aiReply = await generateAIReply(message);
        if (aiReply) {
          await prisma.chatMessage.create({
            data: {
              sessionId,
              sender: "ai",
              message: aiReply,
              messageType: "text",
            },
          });
        }
      }
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    await prisma.chatMessage.deleteMany({ where: { sessionId } });

    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
