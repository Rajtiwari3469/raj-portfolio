import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const SYSTEM_PROMPT = `You are Raj Tiwari's AI assistant on his portfolio website. You are friendly, professional, and helpful. You help visitors with their inquiries about Raj's services.

IMPORTANT RULES:
- Never reveal you are an AI. Always respond as "Raj's Assistant" or just naturally.
- Keep responses concise (2-3 sentences max unless explaining something detailed).
- Be conversational and warm, like a real human assistant.
- If someone asks to talk to Raj directly, say "Raj Sir will be with you shortly!"

ABOUT RAJ TIWARI:
- BCA CS & IT Student
- Software Developer & AI Technology Enthusiast
- Builds web applications, mobile apps, and AI-powered solutions
- Available for freelance projects and full-time opportunities

SERVICES & PRICING:
- Web Development (React, Next.js, Node.js): Starting from ₹15,000
- Mobile App Development (React Native, Flutter): Starting from ₹25,000
- Full-Stack Projects: Starting from ₹25,000
- AI/ML Solutions: Starting from ₹30,000
- Portfolio Website: Starting from ₹8,000
- E-commerce Website: Starting from ₹25,000
- Payment: 50% advance, 50% on completion

CONVERSATION FLOW:
1. Greet the visitor warmly
2. Ask how you can help them
3. Understand their project/requirement
4. Provide relevant information about services and pricing
5. If they seem satisfied, ask: "Is there anything else I can help you with? If you're happy with our chat, please rate your experience from 1-5 stars!"
6. If they say "bye", "thank you", "done", or seem to be ending the conversation, ask for a rating.
7. When they give a rating (1-5), thank them and say goodbye.

RATING DETECTION:
- If the visitor's message contains a number 1-5 (like "4", "5 stars", "rating 3"), treat it as a rating
- After receiving a rating, respond with: "Thank you for rating {X}/5! We appreciate your feedback. Have a great day! 🌟"
- Do NOT ask for rating again after receiving one.

Remember: Be helpful first, ask for rating only at the end of a natural conversation.`;

async function generateAIReply(
  visitorMessage: string,
  conversationHistory: { sender: string; message: string }[]
): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return "";

    const historyText = conversationHistory
      .map((m) => `${m.sender === "visitor" ? "Visitor" : "Assistant"}: ${m.message}`)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\nCONVERSATION HISTORY:\n${historyText}\n\nVisitor's latest message: ${visitorMessage}\n\nRespond as the Assistant:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    );

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
}

function detectRating(message: string): number | null {
  const cleaned = message.toLowerCase().trim();
  const match = cleaned.match(/(\d)\s*(\/\s*5|stars?|out\s*of\s*5)?/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 5) return num;
  }
  if (cleaned === "1" || cleaned === "2" || cleaned === "3" || cleaned === "4" || cleaned === "5") {
    return parseInt(cleaned);
  }
  return null;
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

    if (messageType === "rating") {
      const ratingValue = typeof body.rating === "number" ? body.rating : detectRating(message);
      const chatMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          sender: "visitor",
          message: message,
          messageType: "text",
          rating: ratingValue,
        },
      });

      if (ratingValue) {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            sender: "ai",
            message: `Thank you for rating ${ratingValue}/5! We appreciate your feedback. Have a great day! 🌟`,
            messageType: "text",
          },
        });
      }

      return NextResponse.json(chatMessage, { status: 201 });
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
      const aiSetting = await prisma.setting.findUnique({
        where: { key: "chatAIEnabled" },
      });
      const aiEnabled = aiSetting?.value === "true";

      if (aiEnabled) {
        const history = await prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
          select: { sender: true, message: true },
        });

        const conversationHistory = history.map((m) => ({
          sender: m.sender,
          message: m.message,
        }));

        const rating = detectRating(message);
        if (rating) {
          await prisma.chatMessage.update({
            where: { id: chatMessage.id },
            data: { rating },
          });

          await prisma.chatMessage.create({
            data: {
              sessionId,
              sender: "ai",
              message: `Thank you for rating ${rating}/5! We appreciate your feedback. Have a great day! 🌟`,
              messageType: "text",
            },
          });
        } else {
          const aiReply = await generateAIReply(message, conversationHistory);
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
