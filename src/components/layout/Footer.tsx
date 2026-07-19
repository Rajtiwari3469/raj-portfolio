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
    <footer className="glass mt-auto py-10 border-t border-white/[0.05]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold gradient-text">Raj Tiwari</h3>
            <p className="text-foreground/40 text-xs leading-relaxed">
              BCA CS & IT Student passionate about software development and AI technology.
            </p>
            <div className="flex gap-2">
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

          <div className="space-y-3">
            <h4 className="font-semibold tracking-wide text-xs">Quick Links</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="text-foreground/40 hover:text-primary transition-colors text-xs">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/40 hover:text-primary transition-colors text-xs">
                  About
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-foreground/40 hover:text-primary transition-colors text-xs">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/#certificates" className="text-foreground/40 hover:text-primary transition-colors text-xs">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold tracking-wide text-xs">Services</h4>
            <ul className="space-y-1.5">
              <li className="text-foreground/40 text-xs">Web Development</li>
              <li className="text-foreground/40 text-xs">Application Development</li>
              <li className="text-foreground/40 text-xs">Software Development</li>
              <li className="text-foreground/40 text-xs">AI Solutions</li>
              <li className="text-foreground/40 text-xs">UI/UX Design</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold tracking-wide text-xs">Contact</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-foreground/40 text-xs">
                <Mail size={12} />
                <span>{socialLinks.email || "raj@example.com"}</span>
              </li>
              <li className="flex items-center gap-2 text-foreground/40 text-xs">
                <MapPin size={12} />
                <span>{socialLinks.location || "India"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-white/[0.05] flex flex-col items-center gap-2">
          <p className="text-foreground/30 text-xs">
            &copy; {new Date().getFullYear()} Raj Tiwari. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/terms" className="text-foreground/30 hover:text-foreground/60 text-xs transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-foreground/30 hover:text-foreground/60 text-xs transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
