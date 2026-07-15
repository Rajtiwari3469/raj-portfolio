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
    <footer className="glass mt-auto py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold gradient-text">Raj Tiwari</h3>
            <p className="text-foreground/60">
              BCA CS & IT Student passionate about software development and AI technology.
            </p>
            <div className="flex gap-4">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <GithubIcon size={20} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <LinkedinIcon size={20} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <InstagramIcon size={20} />
                </a>
              )}
              {socialLinks.x && (
                <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <XIcon size={20} />
                </a>
              )}
              {socialLinks.leetcode && (
                <a href={socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <LeetcodeIcon size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/60 hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-foreground/60 hover:text-foreground transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/#certificates" className="text-foreground/60 hover:text-foreground transition-colors">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2">
              <li className="text-foreground/60">Web Development</li>
              <li className="text-foreground/60">Software Development</li>
              <li className="text-foreground/60">AI Solutions</li>
              <li className="text-foreground/60">Full Stack Apps</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-foreground/60">
                <Mail size={16} />
                <span>raj@example.com</span>
              </li>
              <li className="flex items-center gap-2 text-foreground/60">
                <MapPin size={16} />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-glass-border text-center">
          <p className="text-foreground/60">
            © {new Date().getFullYear()} Raj Tiwari. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
