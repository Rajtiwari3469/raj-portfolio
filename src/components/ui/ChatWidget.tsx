"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatMsg {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("chat-session-id");
  if (!id) {
    id = "visitor-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("chat-session-id", id);
  }
  return id;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat?sessionId=${sessionId}`);
      if (res.ok) {
        const data: ChatMsg[] = await res.json();
        setMessages(data);
        if (isOpen) {
          setUnread(0);
        } else {
          const adminMsgs = data.filter(
            (m) => m.sender === "admin" && new Date(m.createdAt) > new Date(Date.now() - 30000)
          );
          setUnread(adminMsgs.length);
        }
      }
    } catch {}
  }, [sessionId, isOpen]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    const msg = input.trim();
    setInput("");

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sender: "visitor", message: msg }),
      });
      fetchMessages();
    } catch {}
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
        onClick={() => {
          setIsOpen(!isOpen);
          setUnread(0);
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-sm">Chat with Raj</h3>
                  <p className="text-xs text-foreground/50">Usually replies instantly</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-foreground/40 text-sm py-8">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Send a message to start chatting!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === "visitor"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white/10 text-foreground/90 rounded-bl-md"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-transform"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
