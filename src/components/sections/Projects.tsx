"use client";

import { motion } from "framer-motion";
import { ExternalLink, Folder } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import GlassPanel from "@/components/ui/GlassPanel";

const projects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with user authentication, product management, shopping cart, and payment integration.",
    image: "/projects/ecommerce.jpg",
    technology: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    githubUrl: "https://github.com/rajtiwari/ecommerce",
    liveUrl: "https://ecommerce-demo.vercel.app",
    category: "Full Stack",
    status: "completed",
  },
  {
    title: "AI Chat Application",
    description: "Real-time chat application with AI-powered responses using OpenAI API and natural language processing.",
    image: "/projects/ai-chat.jpg",
    technology: ["React", "Node.js", "Socket.io", "OpenAI"],
    githubUrl: "https://github.com/rajtiwari/ai-chat",
    liveUrl: "https://ai-chat-demo.vercel.app",
    category: "AI/ML",
    status: "completed",
  },
  {
    title: "Task Management System",
    description: "Project management tool with drag-and-drop interface, team collaboration features, and real-time updates.",
    image: "/projects/taskmanager.jpg",
    technology: ["React", "Express", "MongoDB", "Socket.io"],
    githubUrl: "https://github.com/rajtiwari/taskmanager",
    liveUrl: "https://taskmanager-demo.vercel.app",
    category: "Full Stack",
    status: "completed",
  },
  {
    title: "Portfolio Website",
    description: "This very portfolio website built with Next.js, Three.js, and modern web technologies.",
    image: "/projects/portfolio.jpg",
    technology: ["Next.js", "Three.js", "Framer Motion", "Tailwind"],
    githubUrl: "https://github.com/rajtiwari/portfolio",
    liveUrl: "https://rajbtiwari.dev",
    category: "Frontend",
    status: "active",
  },
  {
    title: "Weather Dashboard",
    description: "Beautiful weather application with location-based forecasts, interactive maps, and weather alerts.",
    image: "/projects/weather.jpg",
    technology: ["React", "OpenWeather API", "Chart.js", "Geolocation"],
    githubUrl: "https://github.com/rajtiwari/weather",
    liveUrl: "https://weather-demo.vercel.app",
    category: "Frontend",
    status: "completed",
  },
  {
    title: "Blog Platform",
    description: "Full-featured blogging platform with markdown support, categories, and SEO optimization.",
    image: "/projects/blog.jpg",
    technology: ["Next.js", "MDX", "Prisma", "PostgreSQL"],
    githubUrl: "https://github.com/rajtiwari/blog",
    liveUrl: "https://blog-demo.vercel.app",
    category: "Full Stack",
    status: "completed",
  },
];

const categories = ["All", "Full Stack", "Frontend", "AI/ML"];

export default function Projects() {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
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
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <GithubIcon size={16} />
                    Code
                  </a>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

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
