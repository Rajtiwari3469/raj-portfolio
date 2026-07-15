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
      title: "Certificates",
      value: stats.certificates,
      icon: <Award className="w-6 h-6" />,
      color: "text-gold",
      bgColor: "bg-gold/20",
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <a
              href="/admin/projects"
              className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-primary/20 transition-colors"
            >
              <FolderKanban size={20} className="text-primary" />
              <span>Projects</span>
            </a>
            <a
              href="/admin/skills"
              className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-accent/20 transition-colors"
            >
              <Code2 size={20} className="text-accent" />
              <span>Skills</span>
            </a>
            <a
              href="/admin/certificates"
              className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-gold/20 transition-colors"
            >
              <Award size={20} className="text-gold" />
              <span>Certificates</span>
            </a>
            <a
              href="/admin/content"
              className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-secondary/20 transition-colors"
            >
              <FileText size={20} className="text-secondary" />
              <span>Edit Content</span>
            </a>
            <a
              href="/admin/content"
              className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-green-500/20 transition-colors"
            >
              <GraduationCap size={20} className="text-green-400" />
              <span>Education</span>
            </a>
            <a
              href="/admin/content"
              className="flex items-center gap-3 p-4 rounded-xl bg-glass-bg hover:bg-orange-500/20 transition-colors"
            >
              <Briefcase size={20} className="text-orange-400" />
              <span>Experience</span>
            </a>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
