"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Code2,
  Award,
  FileText,
  GraduationCap,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface Stats {
  projects: number;
  skills: number;
  certificates: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    skills: 0,
    certificates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [projects, skills, certificates] = await Promise.all([
        fetch("/api/admin/projects").then((res) => res.json()),
        fetch("/api/admin/skills").then((res) => res.json()),
        fetch("/api/admin/certificates").then((res) => res.json()),
      ]);

      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        skills: Array.isArray(skills) ? skills.length : 0,
        certificates: Array.isArray(certificates) ? certificates.length : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Projects",
      value: stats.projects,
      icon: <FolderKanban className="w-6 h-6" />,
      color: "text-primary",
      glowColor: "rgba(0,212,255,0.15)",
    },
    {
      title: "Skills",
      value: stats.skills,
      icon: <Code2 className="w-6 h-6" />,
      color: "text-accent",
      glowColor: "rgba(139,92,246,0.15)",
    },
    {
      title: "Certificates",
      value: stats.certificates,
      icon: <Award className="w-6 h-6" />,
      color: "text-gold",
      glowColor: "rgba(234,179,8,0.15)",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-foreground/60 mt-2">Welcome back, Raj!</p>
        </div>
        <button
          onClick={() => { setIsLoading(true); fetchStats(); }}
          className="p-2.5 rounded-xl bg-glass-bg border border-glass-border hover:bg-primary/10 hover:border-primary/20 text-foreground/60 hover:text-primary transition-all duration-200"
          title="Refresh stats"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassPanel className="relative overflow-hidden group">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${card.glowColor}, transparent 70%)` }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {isLoading ? (
                      <span className="inline-block w-12 h-8 bg-white/5 rounded-lg animate-pulse" />
                    ) : (
                      <motion.span
                        key={card.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {card.value}
                      </motion.span>
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 ${card.color} border border-white/5`}>
                  {card.icon}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassPanel className="h-full">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: "/admin/projects", icon: FolderKanban, label: "Projects", color: "text-primary", hover: "hover:bg-primary/10 hover:border-primary/20" },
              { href: "/admin/skills", icon: Code2, label: "Skills", color: "text-accent", hover: "hover:bg-accent/10 hover:border-accent/20" },
              { href: "/admin/certificates", icon: Award, label: "Certificates", color: "text-gold", hover: "hover:bg-yellow-500/10 hover:border-yellow-500/20" },
              { href: "/admin/content", icon: FileText, label: "Edit Content", color: "text-secondary", hover: "hover:bg-secondary/10 hover:border-secondary/20" },
              { href: "/admin/content", icon: GraduationCap, label: "Education", color: "text-green-400", hover: "hover:bg-green-500/10 hover:border-green-500/20" },
              { href: "/admin/content", icon: Briefcase, label: "Experience", color: "text-orange-400", hover: "hover:bg-orange-500/10 hover:border-orange-500/20" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 ${item.hover} transition-all duration-200 group`}
              >
                <item.icon size={20} className={`${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm">{item.label}</span>
              </a>
            ))}
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
