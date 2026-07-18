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

    const sessions = await prisma.chatMessage.groupBy({
      by: ["sessionId"],
      where: { deleted: false },
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    });

    const sessionDetails = await Promise.all(
      sessions.map(async (session) => {
        const lastMessages = await prisma.chatMessage.findMany({
          where: { sessionId: session.sessionId, deleted: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        });
        const unreadCount = await prisma.chatMessage.count({
          where: { sessionId: session.sessionId, read: false, sender: "visitor", deleted: false },
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
          unreadCount,
          rating: ratingMsg?.rating || null,
        };
      })
    );

    return NextResponse.json(sessionDetails);
  } catch (error) {
    console.error("Get admin chat sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}
