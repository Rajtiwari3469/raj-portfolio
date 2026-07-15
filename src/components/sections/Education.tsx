"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface EducationEntry {
  icon?: string;
  title: string;
  subtitle: string;
  institution: string;
  year: string;
  description: string;
  highlights: string[];
}

const defaultEducationData: EducationEntry[] = [
  {
    icon: "GraduationCap",
    title: "Bachelor of Computer Applications (BCA)",
    subtitle: "Computer Science & Information Technology",
    institution: "University Name",
    year: "2022 - 2025",
    description: "Pursuing BCA with specialization in Computer Science and Information Technology. Focusing on software development, data structures, algorithms, and database management.",
    highlights: ["Dean's List", "Programming Club Lead", "Hackathon Winner"],
  },
  {
    icon: "BookOpen",
    title: "Higher Secondary (12th)",
    subtitle: "Science Stream",
    institution: "School Name",
    year: "2020 - 2022",
    description: "Completed higher secondary education with focus on Physics, Chemistry, and Mathematics. Developed strong analytical and problem-solving skills.",
    highlights: ["Science Exhibition", "Math Olympiad"],
  },
];

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "GraduationCap":
      return <GraduationCap className="w-6 h-6" />;
    case "BookOpen":
      return <BookOpen className="w-6 h-6" />;
    default:
      return <GraduationCap className="w-6 h-6" />;
  }
};

export default function Education() {
  const [educationData, setEducationData] = useState<EducationEntry[]>(defaultEducationData);

  const fetchEducation = async () => {
    try {
      const response = await fetch("/api/admin/sections");
      const data = await response.json();
      if (data.educationContent?.entries && data.educationContent.entries.length > 0) {
        setEducationData(data.educationContent.entries);
      }
    } catch (error) {
      console.error("Failed to fetch education:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEducation();
  }, []);

  return (
    <section id="education" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Education & Learning</span>
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            My academic journey and continuous learning path
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold mb-8 flex items-center gap-2"
          >
            <GraduationCap className="text-primary" />
            Education
          </motion.h3>

          <div className="space-y-6">
            {educationData.map((edu, index) => (
              <motion.div
                key={edu.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <GlassPanel hover glow="primary">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                      {getIcon(edu.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{edu.title}</h4>
                        <span className="text-sm text-foreground/60">{edu.year}</span>
                      </div>
                      <p className="text-foreground/80 font-medium">{edu.subtitle}</p>
                      <p className="text-foreground/60 text-sm mb-3">{edu.institution}</p>
                      <p className="text-foreground/70 text-sm mb-4">{edu.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {edu.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="px-3 py-1 rounded-full bg-glass-bg text-xs text-foreground/70"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
