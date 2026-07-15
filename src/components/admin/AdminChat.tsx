"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";

interface ChatMsg {
  id: string;
  sessionId: string;
  sender: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Session {
  sessionId: string;
  messageCount: number;
  lastMessage: ChatMsg | null;
  unreadCount: number;
}

export default function AdminChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        setSessions(await res.json());
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/messages?sessionId=${sessionId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    fetchMessages(activeSession);
    const interval = setInterval(() => fetchMessages(activeSession), 3000);
    return () => clearInterval(interval);
  }, [activeSession, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !activeSession) return;
    const msg = reply.trim();
    setReply("");

    try {
      await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession, message: msg }),
      });
      fetchMessages(activeSession);
      fetchSessions();
    } catch {}
  };

  if (activeSession) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSession(null)}
            className="p-2 rounded-lg hover:bg-glass-bg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">Chat Session</h2>
            <p className="text-foreground/50 text-sm">{activeSession}</p>
          </div>
        </div>

        <GlassPanel className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-foreground/40 py-8">No messages yet</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[75%]">
                  <p className="text-xs text-foreground/40 mb-1">
                    {msg.sender === "admin" ? "You" : "Visitor"} ·{" "}
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === "admin"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white/10 text-foreground/90 rounded-bl-md"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-glass-border flex gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder="Type a reply..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
            />
            <Button onClick={sendReply} variant="primary" disabled={!reply.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Live Chat</h1>
        <p className="text-foreground/60 mt-1">View and reply to visitor messages</p>
      </motion.div>

      {loading ? (
        <p className="text-foreground/40 py-8 text-center">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <MessageCircle size={48} className="mx-auto mb-4 text-foreground/30" />
          <p className="text-foreground/60">No chat sessions yet</p>
          <p className="text-foreground/40 text-sm mt-1">Visitor messages will appear here</p>
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <motion.button
              key={session.sessionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveSession(session.sessionId)}
              className="w-full text-left"
            >
              <GlassPanel className="flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageCircle size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {session.sessionId.substring(0, 30)}...
                    </p>
                    <p className="text-foreground/50 text-xs">
                      {session.lastMessage?.message.substring(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {session.unreadCount > 0 && (
                    <span className="inline-block w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mb-1">
                      {session.unreadCount}
                    </span>
                  )}
                  <p className="text-foreground/40 text-xs">
                    {session.lastMessage &&
                      new Date(session.lastMessage.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </GlassPanel>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
