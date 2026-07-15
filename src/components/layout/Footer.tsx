"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";

export default function Footer() {
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
                <Phone size={16} />
                <span>+91 XXXXX XXXXX</span>
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
