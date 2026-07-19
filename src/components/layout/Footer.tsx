"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon, LeetcodeIcon } from "@/components/ui/SocialIcons";

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSocialLinks(data))
      .catch(() => {});
  }, []);

  return (
    <footer className="glass mt-auto py-8 border-t border-white/[0.05]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold gradient-text">Raj Tiwari</h3>
            <p className="text-foreground/40 text-xs mt-1">
              BCA CS & IT Student | Software & AI
            </p>
            <div className="flex gap-2 mt-2 justify-center md:justify-start">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/5">
                  <GithubIcon size={16} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-accent/5">
                  <LinkedinIcon size={16} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-neon-purple transition-colors p-1.5 rounded-lg hover:bg-neon-purple/5">
                  <InstagramIcon size={16} />
                </a>
              )}
              {socialLinks.x && (
                <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-white/5">
                  <XIcon size={16} />
                </a>
              )}
              {socialLinks.leetcode && (
                <a href={socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-gold transition-colors p-1.5 rounded-lg hover:bg-gold/5">
                  <LeetcodeIcon size={16} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/" className="text-foreground/40 hover:text-primary transition-colors">Home</Link>
            <Link href="/about" className="text-foreground/40 hover:text-primary transition-colors">About</Link>
            <Link href="/projects" className="text-foreground/40 hover:text-primary transition-colors">Projects</Link>
            <Link href="/#certificates" className="text-foreground/40 hover:text-primary transition-colors">Certificates</Link>
            <Link href="/terms" className="text-foreground/40 hover:text-foreground/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-foreground/40 hover:text-foreground/60 transition-colors">Privacy</Link>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-center gap-2 text-foreground/40 text-xs justify-center md:justify-end">
              <Mail size={12} />
              <span>{socialLinks.email || "raj@example.com"}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/40 text-xs mt-1 justify-center md:justify-end">
              <MapPin size={12} />
              <span>{socialLinks.location || "India"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.05] text-center">
          <p className="text-foreground/30 text-xs">
            &copy; {new Date().getFullYear()} Raj Tiwari. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
