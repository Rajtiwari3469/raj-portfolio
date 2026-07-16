"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Image as ImageIcon, Smile, Mic, MicOff } from "lucide-react";

interface ChatMsg {
  id: string;
  sender: string;
  message: string;
  messageType: string;
  createdAt: string;
}

const EMOJI_LIST = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✨", "🙏", "😎", "🤔", "💪", "🚀", "⭐", "😍", "🙌", "👏", "💻", "🎯", "🌟"];

function generateSessionId(): string {
  return "visitor-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => generateSessionId());
  const [unread, setUnread] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
            (m) => (m.sender === "admin" || m.sender === "ai" || m.sender === "system") &&
            new Date(m.createdAt) > new Date(Date.now() - 30000)
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

  const sendMessage = async (msg: string, type: string = "text") => {
    if (!msg.trim() || !sessionId) return;
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sender: "visitor", message: msg, messageType: type }),
      });
      setInput("");
      setShowEmoji(false);
      fetchMessages();
    } catch {}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        await sendMessage(data.url, "image");
      }
    } catch {}
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
          await sendMessage(base64, "voice");
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

  return (
    <>
      <motion.button
        id="chat-widget-btn"
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
                  className={`flex ${msg.sender === "visitor" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}
                >
                  {msg.sender === "system" ? (
                    <div className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1.5 rounded-full text-center max-w-[90%]">
                      {msg.message}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === "visitor"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white/10 text-foreground/90 rounded-bl-md"
                      }`}
                    >
                      {renderMessage(msg)}
                      {msg.sender === "ai" && (
                        <p className="text-[10px] text-foreground/40 mt-1">AI Assistant</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-3 border-t border-white/10 bg-black/30"
                >
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setInput((prev) => prev + emoji)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 border-t border-white/10">
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={uploading ? "Uploading..." : "Type a message..."}
                  disabled={uploading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || uploading}
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
