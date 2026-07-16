"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string | null;
}

const defaultTechStack = [
  "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL",
  "Tailwind CSS", "Three.js", "Python", "Java", "Git"
];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [techStack, setTechStack] = useState<string[]>(defaultTechStack);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, sectionsRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/admin/sections"),
        ]);
        
        const skillsData = await skillsRes.json();
        if (Array.isArray(skillsData)) {
          setSkills(skillsData);
        }

        const sectionsData = await sectionsRes.json();
        if (sectionsData.techStack && sectionsData.techStack.length > 0) {
          setTechStack(sectionsData.techStack);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <section id="skills" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Skills & Expertise</span>
          </h2>
          <p className="text-foreground/40 max-w-2xl mx-auto tracking-wide">
            Technologies and tools I work with
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground/40">Loading skills...</div>
        ) : skills.length === 0 ? (
          <GlassPanel className="text-center py-12">
            <p className="text-foreground/50">No skills yet. Add skills from the admin dashboard!</p>
          </GlassPanel>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {Object.entries(groupedSkills).map(([category, categorySkills], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, delay: catIndex * 0.2 }}
              >
                <GlassPanel className="h-full">
                  <h3 className="text-xl font-semibold mb-6 gradient-text tracking-wide">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {categorySkills.map((skill, skillIndex) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: skillIndex * 0.1 }}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-foreground/70 tracking-wide">{skill.name}</span>
                          <span className="text-foreground/40 text-sm">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 1, delay: 0.5 + skillIndex * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full shadow-[0_0_10px_var(--primary-glow)]"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlassPanel>
            <h3 className="text-xl font-semibold mb-6 gradient-text text-center tracking-wide">
              Tech Stack
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground/60 hover:border-primary/30 hover:text-primary hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(0,212,255,0.1)] transition-all duration-500 cursor-default tracking-wide text-sm"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  );
}
