"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Code2,
  FileText,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface Stats {
  projects: number;
  skills: number;
  blogs: number;
  messages: number;
  unreadMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    skills: 0,
    blogs: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState<{ id: string; name: string; email: string; message: string; read: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [projects, skills, blogs, messages] = await Promise.all([
        fetch("/api/admin/projects").then((res) => res.json()),
        fetch("/api/admin/skills").then((res) => res.json()),
        fetch("/api/admin/blogs").then((res) => res.json()),
        fetch("/api/admin/messages").then((res) => res.json()),
      ]);

      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        skills: Array.isArray(skills) ? skills.length : 0,
        blogs: Array.isArray(blogs) ? blogs.length : 0,
        messages: Array.isArray(messages) ? messages.length : 0,
        unreadMessages: Array.isArray(messages)
          ? messages.filter((m: { read: boolean }) => !m.read).length
          : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const response = await fetch("/api/admin/messages");
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecentMessages(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    fetchRecentMessages();
  }, []);

  const statCards = [
    {
      title: "Projects",
      value: stats.projects,
      icon: <FolderKanban className="w-6 h-6" />,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Skills",
      value: stats.skills,
      icon: <Code2 className="w-6 h-6" />,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "Blogs",
      value: stats.blogs,
      icon: <FileText className="w-6 h-6" />,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: <MessageSquare className="w-6 h-6" />,
      color: "text-gold",
      bgColor: "bg-gold/20",
      badge: stats.unreadMessages,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-foreground/60 mt-2">Welcome back, Raj!</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassPanel className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {isLoading ? "-" : card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              {card.badge && card.badge > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  {card.badge}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassPanel className="h-full">
            <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message: { id: string; name: string; email: string; message: string; read: boolean }) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-glass-bg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{message.name}</p>
                        {!message.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-foreground/60 truncate">
                        {message.message}
                      </p>
                    </div>
                    {message.read ? (
                      <Eye size={16} className="text-foreground/40" />
                    ) : (
                      <EyeOff size={16} className="text-primary" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/60 text-center py-8">No messages yet</p>
            )}
          </GlassPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassPanel className="h-full">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/projects"
                className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-primary/20 transition-colors"
              >
                <FolderKanban size={20} className="text-primary" />
                <span>Manage Projects</span>
              </a>
              <a
                href="/admin/blogs"
                className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-accent/20 transition-colors"
              >
                <FileText size={20} className="text-accent" />
                <span>Write Blog</span>
              </a>
              <a
                href="/admin/messages"
                className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-gold/20 transition-colors"
              >
                <MessageSquare size={20} className="text-gold" />
                <span>View Messages</span>
              </a>
              <a
                href="/admin/settings"
                className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-secondary/20 transition-colors"
              >
                <Code2 size={20} className="text-secondary" />
                <span>Settings</span>
              </a>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
