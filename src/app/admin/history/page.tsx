"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Download, Folder, ChevronRight, User } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  rating?: number | null;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  messageCount: number;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  rating?: number | null;
}

type Tab = "messages" | "chat";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [allChatMessages, setAllChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const sessionUserMap = useMemo(() => {
    const uniqueSessions = [...new Set(allChatMessages.map((m) => m.sessionId))];
    const sorted = uniqueSessions.sort((a, b) => {
      const aFirst = allChatMessages.find((m) => m.sessionId === a);
      const bFirst = allChatMessages.find((m) => m.sessionId === b);
      return (aFirst?.createdAt || "").localeCompare(bFirst?.createdAt || "");
    });
    const map = new Map<string, string>();
    sorted.forEach((id, i) => map.set(id, `User ${i + 1}`));
    return map;
  }, [allChatMessages]);

  const getUserName = (sessionId: string) => sessionUserMap.get(sessionId) || sessionId;

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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChatMessages = allChatMessages.filter(
    (m) =>
      getUserName(m.sessionId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, ChatMessage[]>();
    filteredChatMessages.forEach((m) => {
      const name = getUserName(m.sessionId);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(m);
    });
    return Array.from(groups.entries()).sort((a, b) => {
      const aNum = parseInt(a[0].replace("User ", "")) || 0;
      const bNum = parseInt(b[0].replace("User ", "")) || 0;
      return aNum - bNum;
    });
  }, [filteredChatMessages, getUserName]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("History Report", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      pageWidth / 2,
      27,
      { align: "center" }
    );

    // Summary
    let y = 35;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Touch Messages: ${messages.length}`, 14, y);
    y += 5;
    doc.text(
      `Pending (Touch Message): ${messages.filter((m) => !m.read).length}`,
      14,
      y
    );
    y += 5;
    doc.text(`Total Chat Messages: ${allChatMessages.length}`, 14, y);
    y += 5;
    doc.text(
      `Pending (Chat): ${allChatMessages.filter((m) => !m.read && m.sender === "visitor").length}`,
      14,
      y
    );
    y += 5;
    doc.text(`Total Chat Sessions: ${chatSessions.length}`, 14, y);
    y += 5;
    doc.text(`Rated Sessions: ${chatSessions.filter((s) => s.rating).length}`, 14, y);
    y += 5;
    doc.text(`Average Rating: ${stats.averageRating}/5`, 14, y);
    y += 10;

    // Touch Message Record
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Touch Message Record", 14, y);
    y += 3;

    if (filteredMessages.length === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No touch messages found.", 14, y + 5);
    } else {
      const msgData = filteredMessages.map((m) => [
        m.name,
        m.email,
        m.subject || "—",
        m.message.substring(0, 60) + (m.message.length > 60 ? "..." : ""),
        m.read ? "Read" : "Pending (Touch Message)",
        formatDate(m.createdAt),
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Name", "Email", "Subject", "Message", "Status", "Date"]],
        body: msgData,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [0, 100, 200], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
        },
        didParseCell: (data) => {
          if (
            data.section === "body" &&
            data.column.index === 4 &&
            data.cell.raw === "Pending (Touch Message)"
          ) {
            data.cell.styles.textColor = [200, 150, 0];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
    }

    // Chat Record - grouped by user
    const sessionGroups = new Map<string, ChatMessage[]>();
    filteredChatMessages.forEach((m) => {
      const name = getUserName(m.sessionId);
      if (!sessionGroups.has(name)) sessionGroups.set(name, []);
      sessionGroups.get(name)!.push(m);
    });

    const sortedGroups = Array.from(sessionGroups.entries()).sort((a, b) => {
      const aNum = parseInt(a[0].replace("User ", "")) || 0;
      const bNum = parseInt(b[0].replace("User ", "")) || 0;
      return aNum - bNum;
    });

    if (sortedGroups.length === 0) {
      doc.addPage();
      y = 20;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Chat Record", 14, y);
      y += 3;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No chat messages found.", 14, y + 5);
    } else {
      sortedGroups.forEach(([userName, msgs], groupIdx) => {
        doc.addPage();
        y = 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Chat Record — ${userName}`, 14, y);
        y += 7;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`${msgs.length} messages`, 14, y);
        y += 5;

        const chatData = msgs.map((m) => [
          m.sender,
          m.message.substring(0, 80) + (m.message.length > 80 ? "..." : ""),
          m.read ? "Read" : "Pending",
          m.rating ? `${m.rating}/5` : "—",
          formatDate(m.createdAt),
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Sender", "Message", "Status", "Rating", "Date"]],
          body: chatData,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [0, 100, 200], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 65 },
            2: { cellWidth: 28 },
            3: { cellWidth: 15 },
            4: { cellWidth: 30 },
          },
          didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 2 && data.cell.raw === "Pending") {
              data.cell.styles.textColor = [200, 150, 0];
              data.cell.styles.fontStyle = "bold";
            }
            if (data.section === "body" && data.column.index === 3 && data.cell.raw !== "—") {
              data.cell.styles.textColor = [245, 158, 11];
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
      });
    }

    doc.save("history-report.pdf");
  };

  const stats = {
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => !m.read).length,
    totalChatSessions: chatSessions.length,
    totalChatMessages: allChatMessages.length,
    unreadChatMessages: allChatMessages.filter(
      (m) => !m.read && m.sender === "visitor"
    ).length,
    ratedSessions: chatSessions.filter((s) => s.rating).length,
    averageRating:
      chatSessions.filter((s) => s.rating).length > 0
        ? (
            chatSessions.reduce((sum, s) => sum + (s.rating || 0), 0) /
            chatSessions.filter((s) => s.rating).length
          ).toFixed(1)
        : "0",
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
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Total Messages</p>
          <p className="text-xl font-bold text-primary">{stats.totalMessages}</p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Pending Messages</p>
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
          <p className="text-foreground/40 text-xs mb-1">Rated Sessions</p>
          <p className="text-xl font-bold text-gold">
            {stats.ratedSessions}
          </p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/[0.08]">
          <p className="text-foreground/40 text-xs mb-1">Avg Rating</p>
          <p className="text-xl font-bold text-gold">
            {stats.averageRating}★
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
                          {msg.read ? "Read" : "Pending"}
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
          <div className="p-4 space-y-3">
            {groupedSessions.length === 0 ? (
              <p className="text-center text-foreground/30 py-12">No chat messages found</p>
            ) : (
              groupedSessions.map(([userName, msgs]) => {
                const isExpanded = expandedSession === userName;
                const rating = msgs.find((m) => m.rating)?.rating;
                return (
                  <div key={userName} className="border border-white/[0.06] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : userName)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                          <Folder size={16} className="text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold">{userName}</p>
                          <p className="text-xs text-foreground/40">{msgs.length} messages</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {rating && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-xs ${s <= rating! ? "text-gold" : "text-foreground/20"}`}>★</span>
                            ))}
                          </div>
                        )}
                        <ChevronRight size={16} className={`text-foreground/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/[0.06] bg-white/[0.01]">
                        <div className="max-h-[400px] overflow-y-auto">
                          {msgs.map((msg) => (
                            <div key={msg.id} className="flex gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                msg.sender === "admin" ? "bg-primary/15" : msg.sender === "ai" ? "bg-purple-500/15" : "bg-secondary/15"
                              }`}>
                                <User size={12} className={
                                  msg.sender === "admin" ? "text-primary" : msg.sender === "ai" ? "text-purple-400" : "text-secondary"
                                } />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-xs font-medium ${
                                    msg.sender === "admin" ? "text-primary" : msg.sender === "ai" ? "text-purple-400" : "text-secondary"
                                  }`}>
                                    {msg.sender === "admin" ? "Admin" : msg.sender === "ai" ? "AI" : "Visitor"}
                                  </span>
                                  <span className="text-[10px] text-foreground/30">{formatDate(msg.createdAt)}</span>
                                  {msg.rating && (
                                    <div className="flex gap-0.5 ml-auto">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className={`text-[10px] ${s <= msg.rating! ? "text-gold" : "text-foreground/20"}`}>★</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-foreground/70 break-words">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
