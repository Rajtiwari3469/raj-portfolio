"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Folder, CheckCircle, Clock } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import GlassPanel from "@/components/ui/GlassPanel";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  technology: string[];
  category: string;
  status: string;
}

type FilterType = "all" | "active" | "completed";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.status === activeFilter;
  });

  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const filters: { id: FilterType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "all", label: "All Projects", count: projects.length, icon: <Folder size={16} /> },
    { id: "active", label: "Active Projects", count: activeProjects.length, icon: <Clock size={16} /> },
    { id: "completed", label: "Completed Projects", count: completedProjects.length, icon: <CheckCircle size={16} /> },
  ];

  return (
    <section id="projects" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Some of my recent work and personal projects
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                activeFilter === filter.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-foreground/60 hover:bg-glass-bg hover:text-foreground border border-transparent"
              }`}
            >
              {filter.icon}
              <span className="font-medium">{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.id
                  ? "bg-primary/30 text-primary"
                  : "bg-glass-bg text-foreground/50"
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground/60">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <GlassPanel className="text-center py-12">
            <p className="text-foreground/60">
              {projects.length === 0
                ? "No projects yet. Add projects from the admin dashboard!"
                : `No ${activeFilter} projects found.`}
            </p>
          </GlassPanel>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlassPanel hover glow="primary" className="h-full flex flex-col">
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-glass-bg">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Folder size={48} className="text-primary/40" />
                    </div>
                    {project.image && (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        project.status === "active"
                          ? "bg-green-500/30 text-green-300 border border-green-500/30"
                          : "bg-blue-500/30 text-blue-300 border border-blue-500/30"
                      }`}>
                        {project.status === "active" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Active
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            Completed
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <span className="text-xs text-foreground/50">{project.category}</span>
                    </div>
                    <p className="text-foreground/70 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technology.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 rounded bg-glass-bg text-xs text-foreground/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-glass-border">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <GithubIcon size={16} />
                        Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={16} />
                        Live Demo
                      </a>
                    )}
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/rajtiwari"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <GithubIcon size={20} />
            View More on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
