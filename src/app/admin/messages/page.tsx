"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, EyeOff, Mail, MailOpen } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
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
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      fetchMessages();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-foreground/60 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading messages...</div>
      ) : messages.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <Mail className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
          <p className="text-foreground/60">No messages yet</p>
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassPanel
                  hover
                  className={`cursor-pointer ${!message.read ? "border-l-4 border-l-primary" : ""}`}
                  onClick={() => openMessage(message)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-glass-bg">
                        {message.read ? (
                          <MailOpen size={20} className="text-foreground/40" />
                        ) : (
                          <Mail size={20} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${!message.read ? "text-foreground" : "text-foreground/80"}`}>
                            {message.name}
                          </h3>
                          {!message.read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-foreground/60 truncate">
                          {message.subject || "No subject"}
                        </p>
                        <p className="text-sm text-foreground/50 truncate mt-1">
                          {message.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/40">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Message Details"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-glass-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{selectedMessage.name}</h3>
                <p className="text-sm text-foreground/60">{selectedMessage.email}</p>
              </div>
            </div>

            {selectedMessage.subject && (
              <div>
                <p className="text-sm text-foreground/60">Subject</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-foreground/60">Message</p>
              <p className="mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-glass-border">
              <p className="text-xs text-foreground/40">
                Received: {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
              <a
                href={`mailto:${selectedMessage.email}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <Mail size={16} />
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
