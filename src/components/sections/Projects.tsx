"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Folder } from "lucide-react";
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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

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

        {isLoading ? (
          <div className="text-center py-12 text-foreground/60">Loading projects...</div>
        ) : projects.length === 0 ? (
          <GlassPanel className="text-center py-12">
            <p className="text-foreground/60">No projects yet. Add projects from the admin dashboard!</p>
          </GlassPanel>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
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
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-primary/20 text-primary"
                      }`}>
                        {project.status}
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
