"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Download } from "lucide-react";
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

    // Chat Record - new page
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Chat Record", 14, y);
    y += 3;

    if (filteredChatMessages.length === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No chat messages found.", 14, y + 5);
    } else {
      const chatData = filteredChatMessages.map((m) => [
        m.sessionId.substring(0, 12) + "...",
        m.sender,
        m.message.substring(0, 60) + (m.message.length > 60 ? "..." : ""),
        m.messageType,
        m.read ? "Read" : "Pending (Chat)",
        m.rating ? `${m.rating}/5` : "—",
        formatDate(m.createdAt),
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Session", "Sender", "Message", "Type", "Status", "Rating", "Date"]],
        body: chatData,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [0, 100, 200], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 18 },
          2: { cellWidth: 45 },
          3: { cellWidth: 18 },
          4: { cellWidth: 28 },
          5: { cellWidth: 15 },
          6: { cellWidth: 28 },
        },
        didParseCell: (data) => {
          if (
            data.section === "body" &&
            data.column.index === 4 &&
            data.cell.raw === "Pending (Chat)"
          ) {
            data.cell.styles.textColor = [200, 150, 0];
            data.cell.styles.fontStyle = "bold";
          }
          if (
            data.section === "body" &&
            data.column.index === 5 &&
            data.cell.raw !== "—"
          ) {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = "bold";
          }
        },
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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    Rating
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
                      colSpan={7}
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
                          {msg.read ? "Read" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {msg.rating ? (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                className={`text-xs ${
                                  s <= msg.rating! ? "text-gold" : "text-foreground/20"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-foreground/20 text-xs">—</span>
                        )}
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
