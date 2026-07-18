import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    const chatSessionsRaw = await prisma.chatMessage.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    });

    const chatSessions = await Promise.all(
      chatSessionsRaw.map(async (session) => {
        const lastMessages = await prisma.chatMessage.findMany({
          where: { sessionId: session.sessionId },
          orderBy: { createdAt: "desc" },
          take: 1,
        });
        const ratingMsg = await prisma.chatMessage.findFirst({
          where: { sessionId: session.sessionId, rating: { not: null } },
          orderBy: { createdAt: "desc" },
          select: { rating: true },
        });
        return {
          sessionId: session.sessionId,
          messageCount: session._count.id,
          lastMessage: lastMessages[0] || null,
          rating: ratingMsg?.rating || null,
        };
      })
    );

    const allChatMessages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      messages,
      chatSessions,
      allChatMessages,
    });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
