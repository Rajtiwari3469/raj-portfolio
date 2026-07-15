"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface Certificate {
  id: string;
  name: string;
  organization: string;
  date: string;
  image: string | null;
  pdfUrl: string | null;
  description: string | null;
}

const educationData = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Bachelor of Computer Applications (BCA)",
    subtitle: "Computer Science & Information Technology",
    institution: "University Name",
    year: "2022 - 2025",
    description: "Pursuing BCA with specialization in Computer Science and Information Technology. Focusing on software development, data structures, algorithms, and database management.",
    highlights: ["Dean's List", "Programming Club Lead", "Hackathon Winner"],
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Higher Secondary (12th)",
    subtitle: "Science Stream",
    institution: "School Name",
    year: "2020 - 2022",
    description: "Completed higher secondary education with focus on Physics, Chemistry, and Mathematics. Developed strong analytical and problem-solving skills.",
    highlights: ["Science Exhibition", "Math Olympiad"],
  },
];

export default function Education() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificates");
      const data = await response.json();
      if (Array.isArray(data)) {
        setCertificates(data);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
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
                        {edu.icon}
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

          <div>
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-semibold mb-8 flex items-center gap-2"
            >
              <Award className="text-accent" />
              Certifications
            </motion.h3>

            {isLoading ? (
              <div className="text-center py-12 text-foreground/60">Loading certificates...</div>
            ) : certificates.length === 0 ? (
              <GlassPanel className="text-center py-12">
                <p className="text-foreground/60">No certificates yet. Add certificates from the admin dashboard!</p>
              </GlassPanel>
            ) : (
              <div className="space-y-4">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <GlassPanel hover glow="accent">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-foreground/60">{cert.organization}</p>
                          {cert.description && (
                            <p className="text-xs text-foreground/50 mt-1">{cert.description}</p>
                          )}
                        </div>
                        <span className="text-sm text-foreground/50">
                          {new Date(cert.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })}
                        </span>
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
              className="mt-8"
            >
              <GlassPanel className="text-center">
                <p className="text-foreground/70 mb-4">
                  Continuously learning and expanding my skill set
                </p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold gradient-text">{certificates.length || 0}+</p>
                    <p className="text-sm text-foreground/60">Certifications</p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
