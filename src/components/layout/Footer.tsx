"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon, LeetcodeIcon } from "@/components/ui/SocialIcons";

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSocialLinks(data))
      .catch(() => {});
  }, []);

  return (
    <footer className="glass mt-auto py-16 border-t border-white/[0.05]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold gradient-text">Raj Tiwari</h3>
            <p className="text-foreground/40 text-sm leading-relaxed">
              BCA CS & IT Student passionate about software development and AI technology.
            </p>
            <div className="flex gap-3">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                  <GithubIcon size={18} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-accent transition-colors p-2 rounded-lg hover:bg-accent/5">
                  <LinkedinIcon size={18} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-neon-purple transition-colors p-2 rounded-lg hover:bg-neon-purple/5">
                  <InstagramIcon size={18} />
                </a>
              )}
              {socialLinks.x && (
                <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-white/5">
                  <XIcon size={18} />
                </a>
              )}
              {socialLinks.leetcode && (
                <a href={socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-gold transition-colors p-2 rounded-lg hover:bg-gold/5">
                  <LeetcodeIcon size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold tracking-wide text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-foreground/40 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/40 hover:text-primary transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-foreground/40 hover:text-primary transition-colors text-sm">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/#certificates" className="text-foreground/40 hover:text-primary transition-colors text-sm">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold tracking-wide text-sm">Services</h4>
            <ul className="space-y-2">
              <li className="text-foreground/40 text-sm">Web Development</li>
              <li className="text-foreground/40 text-sm">Application Development</li>
              <li className="text-foreground/40 text-sm">Software Development</li>
              <li className="text-foreground/40 text-sm">AI Solutions</li>
              <li className="text-foreground/40 text-sm">Full Stack Apps</li>
              <li className="text-foreground/40 text-sm">UI/UX Design</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold tracking-wide text-sm">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-foreground/40 text-sm">
                <Mail size={14} />
                <span>{socialLinks.email || "raj@example.com"}</span>
              </li>
              <li className="flex items-center gap-2 text-foreground/40 text-sm">
                <MapPin size={14} />
                <span>{socialLinks.location || "India"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/30 text-sm">
            &copy; {new Date().getFullYear()} Raj Tiwari. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-foreground/30 hover:text-foreground/60 text-sm transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-foreground/30 hover:text-foreground/60 text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
