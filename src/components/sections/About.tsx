"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Code, Cpu, Rocket } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

const highlights = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Education",
    description: "BCA Computer Science & Information Technology",
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Development",
    description: "Full Stack Web & Software Development",
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "AI Technology",
    description: "Exploring AI & Machine Learning",
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "Innovation",
    description: "Building Future-Ready Solutions",
  },
];

const defaultBio = [
  "I am Raj Tiwari, a passionate BCA Computer Science & Information Technology student with a deep interest in software development, artificial intelligence, and modern technologies.",
  "I enjoy creating innovative digital solutions, building full-stack applications, and exploring AI-powered technologies. My journey in tech is driven by curiosity and a desire to make a meaningful impact through code.",
  "From building responsive web applications to exploring machine learning algorithms, I am constantly pushing the boundaries of what is possible with technology.",
];

const defaultCareerGoals = [
  "Become a proficient Full Stack Developer",
  "Contribute to AI/ML projects",
  "Build scalable and impactful applications",
  "Collaborate with innovative teams",
];

const goalColors = ["bg-primary", "bg-accent", "bg-gold", "bg-secondary"];

export default function About() {
  const [bio, setBio] = useState<string[]>(defaultBio);
  const [careerGoals, setCareerGoals] = useState<string[]>(defaultCareerGoals);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await fetch("/api/admin/sections");
        const data = await response.json();
        if (data.aboutContent) {
          if (data.aboutContent.bio && data.aboutContent.bio.length > 0) {
            setBio(data.aboutContent.bio);
          }
          if (data.aboutContent.careerGoals && data.aboutContent.careerGoals.length > 0) {
            setCareerGoals(data.aboutContent.careerGoals);
          }
        }
      } catch (error) {
        console.error("Failed to fetch about content:", error);
      }
    };
    fetchAbout();
  }, []);

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">About Me</span>
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Passionate about creating innovative digital solutions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassPanel className="space-y-6">
              {bio.map((paragraph, index) => (
                <p
                  key={index}
                  className={index === 0 ? "text-lg text-foreground/80 leading-relaxed" : "text-foreground/70 leading-relaxed"}
                >
                  {index === 0 ? (
                    <>
                      I am <span className="text-primary font-semibold">Raj Tiwari</span>,{paragraph.replace("I am Raj Tiwari, a passionate BCA Computer Science & Information Technology student with a deep interest in software development, artificial intelligence, and modern technologies.", " a passionate BCA Computer Science & Information Technology student with a deep interest in software development, artificial intelligence, and modern technologies.")}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}

              <div className="pt-4">
                <h3 className="text-xl font-semibold mb-4 gradient-text">Career Goals</h3>
                <ul className="space-y-2 text-foreground/70">
                  {careerGoals.map((goal, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${goalColors[index % goalColors.length]}`}></span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <GlassPanel hover glow="primary" className="text-center h-full">
                  <div className="text-primary mb-4 flex justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60">{item.description}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
