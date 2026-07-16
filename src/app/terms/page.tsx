"use client";

import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing and using this portfolio website (raj-portfolio.vercel.app), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this website.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website, including but not limited to text, graphics, logos, images, code, projects, and resume content, is the intellectual property of Raj Tiwari unless otherwise stated. You may not reproduce, distribute, or create derivative works without explicit permission.`,
  },
  {
    title: "Portfolio Content",
    content: `The projects, skills, certificates, and experience showcased on this website represent the personal work and journey of Raj Tiwari. Project descriptions and details are provided for informational and portfolio display purposes. Any code or projects referenced are the creator's own work.`,
  },
  {
    title: "Contact Form",
    content: `When you use the contact form, you agree to provide accurate and truthful information. Messages sent through the contact form will be received by the website owner. The website reserves the right to ignore or not respond to messages that are spam, abusive, or irrelevant.`,
  },
  {
    title: "Live Chat",
    content: `The live chat feature is provided for general inquiries and conversation. Messages may be processed by AI auto-reply systems. The website owner reserves the right to monitor, moderate, or disable the chat feature at any time without notice.`,
  },
  {
    title: "Third-Party Links",
    content: `This website may contain links to third-party platforms such as GitHub, LinkedIn, Instagram, and others. These links are provided for convenience only. Raj Tiwari is not responsible for the content, privacy practices, or availability of these external sites.`,
  },
  {
    title: "Accuracy of Information",
    content: `While every effort is made to keep the information on this website accurate and up to date, Raj Tiwari makes no representations or warranties of any kind about the completeness, accuracy, reliability, or availability of the information, services, or related graphics contained on the website.`,
  },
  {
    title: "Limitation of Liability",
    content: `In no event shall Raj Tiwari be liable for any loss or damage, including without limitation indirect or consequential loss or damage, arising from the use of this website or reliance on any information provided herein.`,
  },
  {
    title: "Changes to Terms",
    content: `Raj Tiwari reserves the right to modify these Terms and Conditions at any time without prior notice. Your continued use of the website following any changes constitutes acceptance of the new terms.`,
  },
  {
    title: "Contact",
    content: `If you have any questions about these Terms and Conditions, please reach out through the contact form on this website or email directly.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Terms & Conditions</span>
            </h1>
            <p className="text-foreground/40 tracking-wide text-sm">
              Last updated: July 2026
            </p>
          </motion.div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <GlassPanel>
                  <h2 className="text-xl font-semibold mb-3 gradient-text">
                    {section.title}
                  </h2>
                  <p className="text-foreground/60 leading-relaxed">
                    {section.content}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
