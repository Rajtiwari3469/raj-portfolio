"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

const defaultExperiences: ExperienceEntry[] = [
  {
    title: "Full Stack Developer Intern",
    company: "Tech Company",
    period: "2024 - Present",
    description: "Developed and maintained web applications using React, Node.js, and PostgreSQL. Implemented RESTful APIs and integrated third-party services.",
    technologies: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    achievements: [
      "Built scalable REST APIs serving 10K+ requests daily",
      "Implemented real-time features using WebSockets",
      "Reduced load time by 40% through optimization"
    ],
  },
  {
    title: "Web Development Freelancer",
    company: "Self-Employed",
    period: "2023 - 2024",
    description: "Provided web development services to small businesses and startups. Built responsive websites and web applications tailored to client needs.",
    technologies: ["React", "Next.js", "Tailwind CSS", "MongoDB"],
    achievements: [
      "Delivered 10+ successful projects",
      "Maintained 100% client satisfaction rate",
      "Specialized in modern, responsive designs"
    ],
  },
  {
    title: "Open Source Contributor",
    company: "Various Projects",
    period: "2023 - Present",
    description: "Active contributor to open source projects. Contributed bug fixes, new features, and documentation improvements to various repositories.",
    technologies: ["Python", "JavaScript", "Git", "GitHub"],
    achievements: [
      "50+ contributions on GitHub",
      "Merged 10+ pull requests",
      "Mentored new contributors"
    ],
  }
];

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>(defaultExperiences);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await fetch("/api/sections");
        const data = await response.json();
        if (data.experienceContent && data.experienceContent.entries && data.experienceContent.entries.length > 0) {
          setExperiences(data.experienceContent.entries);
        }
      } catch (error) {
        console.error("Failed to fetch experience content:", error);
      }
    };
    fetchExperience();
  }, []);
  return (
    <section id="experience" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-foreground/40 max-w-2xl mx-auto tracking-wide">
            My professional journey and development experience
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary/30 via-secondary/30 to-accent/30 hidden lg:block" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex flex-col lg:flex-row gap-8 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className={`lg:w-1/2 ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <GlassPanel hover glow="primary" className="h-full">
                    <div className={`flex items-center gap-2 mb-2 text-primary ${index % 2 === 0 ? "lg:justify-end" : ""}`}>
                      <Briefcase size={16} />
                      <span className="text-sm font-medium tracking-wide">{exp.company}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                    <div className={`flex items-center gap-2 text-foreground/40 text-sm mb-4 ${index % 2 === 0 ? "lg:justify-end" : ""}`}>
                      <Calendar size={14} />
                      <span>{exp.period}</span>
                    </div>
                    <p className="text-foreground/50 mb-4">{exp.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-foreground/60 tracking-wide">Achievements:</h4>
                      <ul className="space-y-1.5">
                        {exp.achievements.map((achievement) => (
                          <li key={achievement} className="text-sm text-foreground/40 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0 shadow-[0_0_6px_var(--accent-glow)]" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs text-foreground/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </GlassPanel>
                </div>

                <div className="hidden lg:flex lg:w-1/2 items-start justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary border-4 border-[#050510] relative z-10 shadow-[0_0_15px_var(--primary-glow)]" />
                </div>

                <div className="lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
