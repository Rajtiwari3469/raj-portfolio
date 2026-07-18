"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Download } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  sender: string;
  message: string;
  messageType: string;
  read: boolean;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  messageCount: number;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

type Tab = "messages" | "chat";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [allChatMessages, setAllChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/history");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setChatSessions(data.chatSessions || []);
        setAllChatMessages(data.allChatMessages || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChatMessages = allChatMessages.filter(
    (m) =>
      m.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => !m.read).length,
    totalChatSessions: chatSessions.length,
    totalChatMessages: allChatMessages.length,
    unreadChatMessages: allChatMessages.filter(
      (m) => !m.read && m.sender === "visitor"
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-foreground/40 mt-1">
            All messages and chat history in one place
          </p>
        </div>
        <button
          onClick={() =>
            exportToCSV(
              activeTab === "messages"
                ? filteredMessages.map((m) => ({
                    Name: m.name,
                    Email: m.email,
                    Subject: m.subject,
                    Message: m.message,
                    Read: m.read ? "Yes" : "No",
                    Date: formatDate(m.createdAt),
                  }))
                : filteredChatMessages.map((m) => ({
                    Session: m.sessionId,
                    Sender: m.sender,
                    Message: m.message,
                    Type: m.messageType,
                    Read: m.read ? "Yes" : "No",
                    Date: formatDate(m.createdAt),
                  })),
              activeTab === "messages"
                ? "touch-messages.csv"
                : "chat-messages.csv"
            )
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Total Messages</p>
          <p className="text-xl font-bold text-primary">{stats.totalMessages}</p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Unread Messages</p>
          <p className="text-xl font-bold text-gold">{stats.unreadMessages}</p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Chat Sessions</p>
          <p className="text-xl font-bold text-secondary">
            {stats.totalChatSessions}
          </p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Total Chat Msgs</p>
          <p className="text-xl font-bold text-accent">
            {stats.totalChatMessages}
          </p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Unread Chats</p>
          <p className="text-xl font-bold text-gold">
            {stats.unreadChatMessages}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "messages"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-foreground/40 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <Mail size={16} />
          Touch Messages ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "chat"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-foreground/40 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <MessageCircle size={16} />
          Chat Messages ({allChatMessages.length})
        </button>
      </div>

      <div className="glass rounded-xl border border-white/[0.08] p-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary/20"
        />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl border border-white/[0.08] overflow-hidden"
      >
        {activeTab === "messages" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-foreground/30"
                    >
                      No messages found
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {msg.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60">
                        {msg.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60 max-w-[200px] truncate">
                        {msg.subject || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60 max-w-[300px] truncate">
                        {msg.message}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            msg.read
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-gold/10 text-gold border border-gold/20"
                          }`}
                        >
                          {msg.read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/40 whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Read
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredChatMessages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-foreground/30"
                    >
                      No chat messages found
                    </td>
                  </tr>
                ) : (
                  filteredChatMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-foreground/40 font-mono">
                        {msg.sessionId.substring(0, 12)}...
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            msg.sender === "admin"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : msg.sender === "visitor"
                              ? "bg-secondary/10 text-secondary border border-secondary/20"
                              : "bg-foreground/10 text-foreground/60 border border-foreground/20"
                          }`}
                        >
                          {msg.sender}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60 max-w-[350px] truncate">
                        {msg.message}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/40">
                        {msg.messageType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            msg.read
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-gold/10 text-gold border border-gold/20"
                          }`}
                        >
                          {msg.read ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/40 whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
