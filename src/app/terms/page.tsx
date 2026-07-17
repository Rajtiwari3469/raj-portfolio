"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ui/ChatWidget";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using this portfolio website ("Website"), you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with these terms, please discontinue use of the Website.`,
  },
  {
    title: "2. Intellectual Property",
    content: `Unless otherwise stated, all content available on this Website—including, but not limited to, text, graphics, logos, images, source code, designs, projects, documents, and resume content—is the intellectual property of Raj Tiwari and is protected by applicable copyright and intellectual property laws.

No content from this Website may be copied, reproduced, modified, distributed, published, or used for commercial purposes without prior written permission from Raj Tiwari.`,
  },
  {
    title: "3. Portfolio Content",
    content: `This Website is intended to showcase Raj Tiwari's portfolio, technical skills, projects, certifications, education, and professional experience.

Project descriptions, demonstrations, and related materials are provided for informational and portfolio purposes only. Some projects may include sample data, demonstration content, or ongoing work that may change over time.`,
  },
  {
    title: "4. Contact Form",
    content: `By submitting information through the contact form, you agree to provide accurate and truthful information.

Messages submitted through the contact form may be reviewed by the Website owner. Spam, abusive, fraudulent, offensive, or irrelevant submissions may be ignored, filtered, or deleted without notice.`,
  },
  {
    title: "5. Live Chat",
    content: `The Website may provide a live chat feature for general communication and inquiries.

Some responses may be generated or assisted by AI technologies. While reasonable efforts are made to provide accurate information, AI-generated responses may occasionally contain inaccuracies and should not be considered professional, legal, financial, or medical advice.

The Website owner reserves the right to suspend, restrict, moderate, or discontinue the live chat feature at any time without prior notice.`,
  },
  {
    title: "6. Third-Party Links",
    content: `This Website may contain links to third-party websites or platforms, including but not limited to GitHub, LinkedIn, Instagram, YouTube, and other external services.

These links are provided solely for your convenience. Raj Tiwari does not control or endorse these third-party websites and is not responsible for their content, availability, security, or privacy practices.`,
  },
  {
    title: "7. Accuracy of Information",
    content: `Reasonable efforts are made to ensure that the information presented on this Website is accurate and up to date.

However, no warranty or representation is made regarding the completeness, accuracy, reliability, suitability, or availability of any information, services, or materials published on the Website.

Information may be updated, modified, or removed without prior notice.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, Raj Tiwari shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from or related to the use of, or inability to use, this Website or any information contained within it.

Your use of this Website is entirely at your own risk.`,
  },
  {
    title: "9. Changes to These Terms",
    content: `Raj Tiwari reserves the right to update or modify these Terms & Conditions at any time without prior notice.

The updated version will become effective immediately upon publication on this Website. Continued use of the Website after any changes constitutes acceptance of the revised Terms & Conditions.`,
  },
  {
    title: "10. Contact",
    content: `If you have any questions regarding these Terms & Conditions, please contact Raj Tiwari through the contact form available on this Website or via the email address provided on the Contact page.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Terms & Conditions</span>
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
