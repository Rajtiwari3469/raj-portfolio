"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import Button from "@/components/ui/Button";
import dynamic from "next/dynamic";
import Image from "next/image";

const SpaceBackground = dynamic(() => import("@/components/three/SpaceBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-background" />,
});

export default function Hero({ profileImage }: { profileImage: string | null }) {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <SpaceBackground />

      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {profileImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-8 flex justify-center"
            >
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg shadow-primary/20">
                <Image
                  src={profileImage}
                  alt="Raj Tiwari"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/60 mb-4"
          >
            Welcome to my universe
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="gradient-text">Raj Tiwari</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-2 mb-8"
          >
            <p className="text-xl md:text-2xl text-foreground/80">
              BCA CS & IT Student
            </p>
            <p className="text-lg md:text-xl text-foreground/60">
              Software Development & AI Technology
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button variant="primary" size="lg" glow>
              <a href="#projects" className="flex items-center gap-2">
                View Projects
              </a>
            </Button>

            <Button variant="outline" size="lg">
              <a href="/resume.pdf" download className="flex items-center gap-2">
                <Download size={20} />
                Download Resume
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
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown size={24} className="text-foreground/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
