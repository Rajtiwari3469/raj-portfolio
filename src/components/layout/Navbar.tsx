"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Raj Tiwari
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="https://github.com/rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
              <GithubIcon size={20} />
            </a>
            <a href="https://linkedin.com/in/rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
              <LinkedinIcon size={20} />
            </a>
            <a href="https://instagram.com/rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
              <InstagramIcon size={20} />
            </a>
            <a href="https://youtube.com/@rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
              <YoutubeIcon size={20} />
            </a>

            <Button variant="primary" size="sm">
              <Link href="/contact">Contact Me</Link>
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-glass-bg transition-colors"
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
            className="md:hidden glass mt-2 mx-4 rounded-xl overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex gap-4 pt-4 border-t border-glass-border">
                <a href="https://github.com/rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <GithubIcon size={20} />
                </a>
                <a href="https://linkedin.com/in/rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <LinkedinIcon size={20} />
                </a>
                <a href="https://instagram.com/rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <InstagramIcon size={20} />
                </a>
                <a href="https://youtube.com/@rajtiwari" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <YoutubeIcon size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
