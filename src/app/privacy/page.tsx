"use client";

import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";

const sections = [
  {
    title: "Information We Collect",
    content: `This website collects information you voluntarily provide through the contact form and live chat, including your name, email address, subject, and message content. We also collect standard web analytics data such as page views, referral sources, and browser type to understand how visitors interact with the site.`,
  },
  {
    title: "How We Use Your Information",
    content: `Information collected through the contact form is used solely to respond to your inquiries and communicate with you. Analytics data is used to improve the website experience and understand audience demographics. We do not sell, trade, or otherwise transfer your personal information to outside parties.`,
  },
  {
    title: "Cookies & Local Storage",
    content: `This website uses essential cookies for authentication (admin login session) and may use local storage for chat session management. These are strictly necessary for the website to function properly and do not track your browsing activity across other websites.`,
  },
  {
    title: "Data Storage & Security",
    content: `Your messages and contact information are stored securely in a PostgreSQL database hosted on Neon. We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of electronic transmission or storage is 100% secure.`,
  },
  {
    title: "Third-Party Services",
    content: `This website uses the following third-party services that may collect data:\n\n• Vercel (hosting and analytics)\n• Neon (database hosting)\n• Resend (email delivery for password reset)\n• Google Gemini AI (chat auto-reply feature)\n\nEach service has its own privacy policy governing how they handle data.`,
  },
  {
    title: "AI Chat Feature",
    content: `The live chat feature may use AI-powered auto-replies powered by Google Gemini. Messages sent through chat are processed to generate responses. Chat sessions are ephemeral and cleared when you close the browser or refresh the page. Admin chat sessions are stored for management purposes.`,
  },
  {
    title: "Data Retention",
    content: `Contact form messages are retained indefinitely unless deletion is requested. Chat messages in active sessions are stored temporarily and cleared on page refresh. Admin data (settings, credentials) is stored permanently as long as the website is active.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to:\n\n• Request access to the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data\n• Opt out of non-essential data collection\n\nTo exercise any of these rights, please contact us through the website's contact form.`,
  },
  {
    title: "Children's Privacy",
    content: `This website is not directed at individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child, we will take steps to delete that information promptly.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated revision date.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions or concerns about this Privacy Policy or our data practices, please reach out through the contact form on this website or email directly.`,
  },
];

export default function PrivacyPage() {
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
              <span className="gradient-text">Privacy Policy</span>
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
                  <p className="text-foreground/60 leading-relaxed whitespace-pre-line">
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
