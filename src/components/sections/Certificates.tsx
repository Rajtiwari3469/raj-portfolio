"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Image from "next/image";

interface Certificate {
  id: string;
  name: string;
  organization: string;
  date: string;
  image: string | null;
  pdfUrl: string | null;
  description: string | null;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificates");
      const data = await response.json();
      if (Array.isArray(data)) {
        setCertificates(data);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCertificates();
  }, []);

  return (
    <section id="certificates" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Certificates</span>
          </h2>
          <p className="text-foreground/40 max-w-2xl mx-auto tracking-wide">
            My professional certifications and achievements
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground/40">Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <GlassPanel className="text-center py-12">
            <p className="text-foreground/50">No certificates yet. Add certificates from the admin dashboard!</p>
          </GlassPanel>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlassPanel hover glow="accent" className="h-full flex flex-col">
                  {cert.image && (
                    <div className="h-48 rounded-xl overflow-hidden mb-4 bg-white/[0.02] border border-white/[0.04]">
                      <Image
                        src={cert.image}
                        alt={cert.name}
                        width={600}
                        height={300}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {!cert.image && (
                    <div className="h-48 rounded-xl mb-4 bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                      <Award size={40} className="text-gold/30" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">{cert.name}</h3>
                    </div>
                    <p className="text-sm text-foreground/40 mb-2">{cert.organization}</p>
                    {cert.description && (
                      <p className="text-sm text-foreground/50 line-clamp-2 mb-3">
                        {cert.description}
                      </p>
                    )}
                    <p className="text-xs text-foreground/30">
                      {new Date(cert.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>

                  {cert.pdfUrl && (
                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors"
                      >
                        <ExternalLink size={14} />
                        View Certificate
                      </a>
                    </div>
                  )}
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )}

        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <GlassPanel className="text-center">
              <p className="text-foreground/50 mb-4 tracking-wide">
                Continuously learning and expanding my skill set
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">{certificates.length}+</p>
                  <p className="text-sm text-foreground/40">Certifications</p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </div>
    </section>
  );
}
