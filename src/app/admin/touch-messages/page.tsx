"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Trash2, Eye, EyeOff, Search, MessageSquare, Calendar, Clock, Loader2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function TouchMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages");
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (id: string, read: boolean) => {
    try {
      await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read }),
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read } : msg))
      );
      toast(read ? "Marked as read" : "Marked as unread");
    } catch (error) {
      console.error("Failed to update message:", error);
      toast("Failed to update message", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/messages?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== deleteId));
        if (selectedMessage?.id === deleteId) setSelectedMessage(null);
        toast("Message deleted");
      } else {
        toast("Failed to delete message", "error");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast("Failed to delete message", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "unread" && !msg.read) ||
      (filterType === "read" && msg.read);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((msg) => !msg.read).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Touch Messages</h1>
          <p className="text-foreground/60 mt-1">
            Messages from your portfolio contact form
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/15">
            {messages.length} Total
          </span>
          {unreadCount > 0 && (
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/15 text-green-400 border border-green-500/15">
              {unreadCount} Unread
            </span>
          )}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={18} />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filterType === type
                  ? "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,212,255,0.05)]"
                  : "text-foreground/60 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <GlassPanel className="text-center py-16">
          <MessageSquare size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="text-foreground/60">
            {messages.length === 0
              ? "No messages yet. Messages from your contact form will appear here."
              : "No messages match your search."}
          </p>
        </GlassPanel>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">#</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Subject</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Message</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Time</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg, index) => (
                    <motion.tr
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        !msg.read ? "bg-primary/[0.03]" : ""
                      }`}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.read) handleMarkAsRead(msg.id, true);
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-foreground/50">{index + 1}</td>
                      <td className="px-4 py-3">
                        {!msg.read ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400 block animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-foreground/15 block" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{msg.name}</td>
                      <td className="px-4 py-3 text-sm text-primary">{msg.email}</td>
                      <td className="px-4 py-3 text-sm text-foreground/70 max-w-[150px] truncate">
                        {msg.subject || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/70 max-w-[200px] truncate">
                        {msg.message}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(msg.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatTime(msg.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleMarkAsRead(msg.id, !msg.read)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-foreground transition-colors"
                            title={msg.read ? "Mark as unread" : "Mark as read"}
                          >
                            {msg.read ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => setDeleteId(msg.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="relative">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedMessage.name}</h2>
                      <p className="text-sm text-primary">{selectedMessage.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(selectedMessage.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatTime(selectedMessage.createdAt)}
                    </span>
                  </div>

                  {selectedMessage.subject && (
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Subject</p>
                      <p className="font-medium">{selectedMessage.subject}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Message</p>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your message"}`}
                      className="flex-1"
                    >
                      <Button variant="primary" className="w-full">
                        <Mail size={16} className="mr-2" />
                        Reply via Email
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      onClick={() => { setSelectedMessage(null); setDeleteId(selectedMessage.id); }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
