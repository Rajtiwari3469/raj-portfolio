"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, ArrowLeft, Image as ImageIcon, Smile, Mic, MicOff, Bot, Trash2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface ChatMsg {
  id: string;
  sessionId: string;
  sender: string;
  message: string;
  messageType: string;
  read: boolean;
  createdAt: string;
}

interface Session {
  sessionId: string;
  messageCount: number;
  lastMessage: ChatMsg | null;
  unreadCount: number;
}

const EMOJI_LIST = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✨", "🙏", "😎", "🤔", "💪", "🚀", "⭐", "😍", "🙌", "👏", "💻", "🎯", "🌟"];

export default function AdminChat() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        setSessions(await res.json());
      }
    } catch {}
    setLoading(false);
  }, []);

  const fetchAiStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setAiEnabled(data?.chatAIEnabled === "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchAiStatus();
    const interval = setInterval(() => {
      fetchSessions();
      fetchAiStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchAiStatus]);

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

  const toggleAI = async () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    try {
      await fetch("/api/admin/chat/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiEnabled: newState }),
      });
      toast(newState ? "AI auto-reply enabled" : "AI auto-reply disabled");
    } catch {
      setAiEnabled(!newState);
      toast("Failed to toggle AI", "error");
    }
  };

  const deleteChat = async () => {
    if (!deleteSessionId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/chat?sessionId=${deleteSessionId}`, { method: "DELETE" });
      setActiveSession(null);
      fetchSessions();
      toast("Chat deleted");
    } catch {
      toast("Failed to delete chat", "error");
    } finally {
      setIsDeleting(false);
      setDeleteSessionId(null);
    }
  };

  const sendReply = async (msg: string, type: string = "text") => {
    if (!msg.trim() || !activeSession) return;
    const message = msg.trim();
    setReply("");
    setShowEmoji(false);

    try {
      await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession, message, messageType: type }),
      });
      fetchMessages(activeSession);
      fetchSessions();
    } catch {
      toast("Failed to send message", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        await sendReply(data.url, "image");
      } else {
        toast("Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          await sendReply(base64, "voice");
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {}
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const renderMessage = (msg: ChatMsg) => {
    if (msg.messageType === "image") {
      return <img src={msg.message} alt="Chat image" className="max-w-[200px] rounded-lg" />;
    }
    if (msg.messageType === "voice") {
      return <audio controls src={msg.message} className="max-w-[200px] h-8" />;
    }
    return msg.message;
  };

  if (activeSession) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
          <button
            onClick={() => setDeleteSessionId(activeSession)}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
            title="Delete chat"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <GlassPanel className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-foreground/40 py-8">No messages yet</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "admin" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"
                }`}
              >
                {msg.sender === "system" ? (
                  <div className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1.5 rounded-full text-center max-w-[90%]">
                    {msg.message}
                  </div>
                ) : (
                  <div className="max-w-[75%]">
                    <p className="text-xs text-foreground/40 mb-1">
                      {msg.sender === "admin" ? "You" : msg.sender === "ai" ? "AI Assistant" : "Visitor"} ·{" "}
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === "admin"
                          ? "bg-primary text-white rounded-br-md"
                          : msg.sender === "ai"
                          ? "bg-purple-500/20 text-purple-300 rounded-bl-md"
                          : "bg-white/10 text-foreground/90 rounded-bl-md"
                      }`}
                    >
                      {renderMessage(msg)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showEmoji && (
            <div className="px-4 py-2 border-t border-glass-border bg-black/30">
              <div className="flex flex-wrap gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setReply((prev) => prev + emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-glass-border">
            <div className="flex gap-2 items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-white/5 transition-colors"
                title="Upload image"
              >
                <ImageIcon size={18} />
              </button>
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-white/5 transition-colors"
                title="Emoji"
              >
                <Smile size={18} />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isRecording ? "text-red-400 bg-red-500/20 animate-pulse" : "text-foreground/50 hover:text-primary hover:bg-white/5"
                }`}
                title={isRecording ? "Stop recording" : "Voice message"}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply(reply)}
                placeholder={uploading ? "Uploading..." : "Type a reply..."}
                disabled={uploading}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
              />
              <Button onClick={() => sendReply(reply)} variant="primary" disabled={!reply.trim() || uploading}>
                <Send size={16} />
              </Button>
            </div>
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Live Chat</h1>
          <p className="text-foreground/60 mt-1">View and reply to visitor messages</p>
        </div>
        <button
          onClick={toggleAI}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            aiEnabled
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 text-foreground/60 border border-white/10 hover:border-white/20"
          }`}
        >
          <Bot size={18} />
          AI {aiEnabled ? "Active" : "Off"}
        </button>
      </motion.div>

      {aiEnabled && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-sm text-purple-300">
          AI auto-reply is ON. The AI assistant is responding to visitors on your behalf.
        </div>
      )}

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

      <ConfirmModal
        isOpen={!!deleteSessionId}
        title="Delete Chat Session"
        message="Are you sure you want to delete this entire chat session? All messages will be lost."
        onConfirm={deleteChat}
        onCancel={() => setDeleteSessionId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
