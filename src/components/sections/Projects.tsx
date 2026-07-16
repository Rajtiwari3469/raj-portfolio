"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Folder, CheckCircle, Clock, X, Github } from "lucide-react";
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

type FilterType = "all" | "active" | "in-progress" | "completed";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
  const inProgressProjects = projects.filter((p) => p.status === "in-progress");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const filters: { id: FilterType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "all", label: "All Projects", count: projects.length, icon: <Folder size={16} /> },
    { id: "active", label: "Active", count: activeProjects.length, icon: <Clock size={16} /> },
    { id: "in-progress", label: "In Progress", count: inProgressProjects.length, icon: <Clock size={16} /> },
    { id: "completed", label: "Completed", count: completedProjects.length, icon: <CheckCircle size={16} /> },
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
                <GlassPanel
                  hover
                  glow="primary"
                  className="h-full flex flex-col cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
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
                          : project.status === "in-progress"
                          ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                          : "bg-blue-500/30 text-blue-300 border border-blue-500/30"
                      }`}>
                        {project.status === "active" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Active
                          </>
                        ) : project.status === "in-progress" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            In Progress
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
                      <span className="flex items-center gap-1 text-sm text-foreground/60">
                        <GithubIcon size={16} />
                        Code
                      </span>
                    )}
                    {project.liveUrl && (
                      <span className="flex items-center gap-1 text-sm text-primary">
                        <ExternalLink size={16} />
                        Live Demo
                      </span>
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

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="relative">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-glass-bg hover:bg-red-500/20 hover:text-red-400 transition-colors z-10"
                >
                  <X size={20} />
                </button>

                <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-glass-bg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Folder size={64} className="text-primary/30" />
                  </div>
                  {selectedProject.image && (
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                      selectedProject.status === "active"
                        ? "bg-green-500/30 text-green-300 border border-green-500/30"
                        : selectedProject.status === "in-progress"
                        ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                        : "bg-blue-500/30 text-blue-300 border border-blue-500/30"
                    }`}>
                      {selectedProject.status === "active" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          Active
                        </>
                      ) : selectedProject.status === "in-progress" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          In Progress
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Completed
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {selectedProject.category}
                      </span>
                    </div>
                    <p className="text-foreground/70 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground/60 mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technology.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 rounded-lg bg-glass-bg text-sm text-foreground/70 border border-glass-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(selectedProject.githubUrl || selectedProject.liveUrl) && (
                    <div className="flex gap-4 pt-4 border-t border-glass-border">
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass-bg hover:bg-foreground/10 transition-colors"
                        >
                          <Github size={18} />
                          <span className="font-medium">View Source Code</span>
                        </a>
                      )}
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                        >
                          <ExternalLink size={18} />
                          <span className="font-medium">Live Demo</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
