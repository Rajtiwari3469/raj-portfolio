"use client";

import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ui/ChatWidget";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We may collect information that you voluntarily provide through this Website, including:

• Name
• Email address
• Subject
• Message content
• Any additional information you choose to submit through the contact form or live chat

We may also collect standard technical and analytical information, such as:

• Browser type
• Device information
• IP address (where applicable)
• Pages visited
• Referral sources
• General usage statistics

This information helps us improve the performance, functionality, and user experience of the Website.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `Information collected through this Website may be used to:

• Respond to your inquiries or messages.
• Communicate with you regarding your requests.
• Improve the Website's performance and user experience.
• Monitor usage patterns and troubleshoot technical issues.
• Protect the Website against spam, abuse, and unauthorized access.

We do not sell or rent your personal information to third parties. Information may only be disclosed where required by applicable law or to protect our legal rights.`,
  },
  {
    title: "3. Cookies and Local Storage",
    content: `This Website may use cookies and browser local storage to support essential functionality, including:

• User authentication
• Session management
• Website preferences
• Performance improvements

These technologies are used solely to provide and improve the Website's functionality and are not intended to track your activity across unrelated websites.`,
  },
  {
    title: "4. Data Storage and Security",
    content: `Information submitted through this Website may be stored securely using trusted cloud infrastructure and database services.

Reasonable administrative, technical, and organizational measures are implemented to help protect personal information from unauthorized access, alteration, disclosure, or destruction.

However, no method of electronic transmission or storage is completely secure. Therefore, absolute security cannot be guaranteed.`,
  },
  {
    title: "5. Third-Party Services",
    content: `This Website may rely on third-party services to provide certain functionality, including but not limited to:

• Vercel (website hosting and deployment)
• Neon (database hosting, if applicable)
• Resend (email delivery services)
• Google Gemini AI (AI-assisted chat responses)

Each third-party provider operates under its own privacy policy and terms of service. We encourage users to review those policies before using related services.`,
  },
  {
    title: "6. AI Chat Feature",
    content: `This Website may include an AI-assisted chat feature to help answer general questions and improve visitor support.

Messages submitted through the chat may be processed by AI systems to generate responses. AI-generated responses are provided for informational purposes only and may occasionally contain inaccuracies.

Please do not submit confidential, sensitive, or highly personal information through the AI chat feature.`,
  },
  {
    title: "7. Data Retention",
    content: `Personal information is retained only for as long as necessary to provide the requested services, maintain Website functionality, comply with legal obligations, resolve disputes, or protect legitimate business interests.

You may request deletion of your personal information, subject to any legal or operational requirements.`,
  },
  {
    title: "8. Your Rights",
    content: `Depending on your location and applicable laws, you may have the right to:

• Request access to your personal information.
• Request correction of inaccurate or incomplete information.
• Request deletion of your personal information.
• Object to or restrict certain types of processing where applicable.

Requests may be submitted using the contact form available on this Website.`,
  },
  {
    title: "9. Children's Privacy",
    content: `This Website is not intended for children under the age of 13.

We do not knowingly collect personal information from children. If we become aware that such information has been collected, reasonable steps will be taken to remove it as soon as practicable.`,
  },
  {
    title: "10. Changes to This Privacy Policy",
    content: `This Privacy Policy may be updated from time to time to reflect changes in technology, legal requirements, or Website functionality.

Any updates will be published on this page, and the "Last Updated" date will be revised accordingly.`,
  },
  {
    title: "11. Contact",
    content: `If you have any questions regarding this Privacy Policy or the way your information is handled, please contact Raj Tiwari through the contact form available on this Website or via the email address provided on the Contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Privacy Policy</span>
            </h1>
            <p className="text-foreground/40 tracking-wide text-sm">
              Last Updated: July 2026
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <h2 className="text-xl font-semibold mb-3 gradient-text">
                  {section.title}
                </h2>
                <div className="glass rounded-2xl p-6 border border-white/[0.06]">
                  {section.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-foreground/60 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
