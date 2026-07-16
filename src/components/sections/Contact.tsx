"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, MessageCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon, LeetcodeIcon } from "@/components/ui/SocialIcons";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface SettingsData {
  email?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  x?: string;
  leetcode?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [settings, setSettings] = useState<SettingsData>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-foreground/40 max-w-2xl mx-auto tracking-wide">
            Have a project in mind? Let&apos;s work together
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassPanel className="h-full">
              <h3 className="text-2xl font-semibold mb-8">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-foreground/40 text-sm">Email</p>
                    <p className="font-medium tracking-wide">{settings.email || "raj@example.com"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-foreground/40 text-sm">Location</p>
                    <p className="font-medium tracking-wide">{settings.location || "India"}</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => {
                    const el = document.getElementById("chat-widget-btn");
                    if (el) el.click();
                  }}
                >
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-foreground/40 text-sm">Live Chat</p>
                    <p className="font-medium tracking-wide">Chat with me instantly</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/[0.05]">
                <p className="text-foreground/40 mb-4 tracking-wide">Connect with me</p>
                <div className="flex gap-3">
                  {settings.github && (
                    <a href={settings.github} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-primary/30 hover:text-primary transition-all">
                      <GithubIcon size={20} />
                    </a>
                  )}
                  {settings.linkedin && (
                    <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-accent/30 hover:text-accent transition-all">
                      <LinkedinIcon size={20} />
                    </a>
                  )}
                  {settings.instagram && (
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-pink-500/30 hover:text-pink-500 transition-all">
                      <InstagramIcon size={20} />
                    </a>
                  )}
                  {settings.x && (
                    <a href={settings.x} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-foreground/30 hover:text-foreground transition-all">
                      <XIcon size={20} />
                    </a>
                  )}
                  {settings.leetcode && (
                    <a href={settings.leetcode} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-gold/30 hover:text-gold transition-all">
                      <LeetcodeIcon size={20} />
                    </a>
                  )}
                </div>
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlassPanel>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Subject"
                  placeholder="Project inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <Textarea
                  label="Message"
                  placeholder="Tell me about your project..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />

                {submitStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-sm ${
                      submitStatus === "success"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {submitStatus === "success"
                      ? "Message sent successfully! Please check your email, we'll touch you through email. If you've provided your contact number, we'll reach out to you as well."
                      : "Failed to send message. Please try again."}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={20} />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
