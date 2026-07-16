"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import Button from "@/components/ui/Button";
import dynamic from "next/dynamic";
import Image from "next/image";

const SpaceBackground = dynamic(() => import("@/components/three/SpaceBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-[#050510]" />,
});

interface HeroProps {
  profileImage: string | null;
  heroTitle: string;
  heroSubtitle: string;
}

export default function Hero({ profileImage, heroTitle, heroSubtitle }: HeroProps) {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <SpaceBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]/80 pointer-events-none" />

      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          {profileImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="mb-10 flex justify-center"
            >
              <div className="relative w-40 h-40 md:w-52 md:h-52">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-secondary animate-rotate-slow opacity-50 blur-md" />
                <div className="absolute inset-1 rounded-full bg-[#050510]" />
                <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_rgba(0,212,255,0.2)]">
                  <Image
                    src={profileImage}
                    alt="Raj Tiwari"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -inset-3 rounded-full border border-primary/10 animate-pulse-neon" />
              </div>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base md:text-lg text-foreground/40 mb-6 tracking-[0.3em] uppercase font-light"
          >
            Welcome to my portfolio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight"
          >
            <span className="gradient-text">Raj Tiwari</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="space-y-3 mb-10"
          >
            <p className="text-xl md:text-2xl text-foreground/70 font-light tracking-wide">
              {heroTitle}
            </p>
            <p className="text-lg md:text-xl text-foreground/40 tracking-wide">
              {heroSubtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button variant="primary" size="lg" glow>
              <a href="#projects" className="flex items-center gap-2">
                View Projects
              </a>
            </Button>

            <Button variant="outline" size="lg">
              <a href="#resume" className="flex items-center gap-2">
                <Download size={20} />
                View Resume
              </a>
            </Button>

            <Button variant="ghost" size="lg">
              <a href="https://github.com/rajtiwari" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <GithubIcon size={20} />
              </a>
            </Button>

            <Button variant="ghost" size="lg">
              <a href="https://linkedin.com/in/rajtiwari" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <LinkedinIcon size={20} />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-foreground/30 tracking-widest uppercase">Scroll</span>
          <ArrowDown size={18} className="text-primary/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
