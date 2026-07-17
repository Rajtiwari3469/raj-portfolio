import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.chatMessage.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    });

    const sessionDetails = await Promise.all(
      sessions.map(async (session) => {
        const lastMessages = await prisma.chatMessage.findMany({
          where: { sessionId: session.sessionId },
          orderBy: { createdAt: "desc" },
          take: 1,
        });
        const unreadCount = await prisma.chatMessage.count({
          where: { sessionId: session.sessionId, read: false, sender: "visitor" },
        });
        return {
          sessionId: session.sessionId,
          messageCount: session._count.id,
          lastMessage: lastMessages[0] || null,
          unreadCount,
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
