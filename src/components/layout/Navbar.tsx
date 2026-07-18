"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon, LeetcodeIcon } from "@/components/ui/SocialIcons";
import Button from "@/components/ui/Button";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/#projects" },
  { name: "Certificates", href: "/#certificates" },
  { name: "Education", href: "/#education" },
  { name: "Skills", href: "/#skills" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSocialLinks(data))
      .catch(() => {
        // Settings unavailable, social links will use defaults
      });
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass py-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-white/[0.05]"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text tracking-tight">
            Raj Tiwari
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground/60 hover:text-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-all duration-300 text-sm tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                <GithubIcon size={18} />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-accent transition-colors p-2 rounded-lg hover:bg-accent/5">
                <LinkedinIcon size={18} />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-neon-purple transition-colors p-2 rounded-lg hover:bg-neon-purple/5">
                <InstagramIcon size={18} />
              </a>
            )}
            {socialLinks.x && (
              <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-white/5">
                <XIcon size={18} />
              </a>
            )}
            {socialLinks.leetcode && (
              <a href={socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-gold transition-colors p-2 rounded-lg hover:bg-gold/5">
                <LeetcodeIcon size={18} />
              </a>
            )}

            <div className="w-px h-6 bg-white/10 mx-1" />

            <Button variant="primary" size="sm">
              <Link href="/contact">Contact Me</Link>
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-foreground/60 hover:text-foreground transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass mt-2 mx-4 rounded-xl overflow-hidden border border-white/[0.05]"
          >
            <div className="p-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/60 hover:text-primary hover:bg-primary/5 transition-all py-2.5 px-3 rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex gap-3 pt-4 mt-2 border-t border-white/[0.05]">
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-primary transition-colors p-2">
                    <GithubIcon size={20} />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-accent transition-colors p-2">
                    <LinkedinIcon size={20} />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-neon-purple transition-colors p-2">
                    <InstagramIcon size={20} />
                  </a>
                )}
                {socialLinks.x && (
                  <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground transition-colors p-2">
                    <XIcon size={20} />
                  </a>
                )}
                {socialLinks.leetcode && (
                  <a href={socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-gold transition-colors p-2">
                    <LeetcodeIcon size={20} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
