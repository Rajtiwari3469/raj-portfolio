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
    <section id="skills" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Skills & Expertise</span>
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Technologies and tools I work with
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground/60">Loading skills...</div>
        ) : skills.length === 0 ? (
          <GlassPanel className="text-center py-12">
            <p className="text-foreground/60">No skills yet. Add skills from the admin dashboard!</p>
          </GlassPanel>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {Object.entries(groupedSkills).map(([category, categorySkills], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: catIndex * 0.2 }}
              >
                <GlassPanel className="h-full">
                  <h3 className="text-xl font-semibold mb-6 gradient-text">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {categorySkills.map((skill, skillIndex) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: skillIndex * 0.1 }}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-foreground/80">{skill.name}</span>
                          <span className="text-foreground/60">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-glass-bg rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 + skillIndex * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
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
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlassPanel>
            <h3 className="text-xl font-semibold mb-6 gradient-text text-center">
              Tech Stack
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="px-4 py-2 rounded-full bg-glass-bg border border-glass-border text-foreground/80 hover:border-primary hover:text-primary transition-colors duration-300 cursor-default"
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
