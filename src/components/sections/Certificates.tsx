"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, X, Calendar, Building2, FileText } from "lucide-react";
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
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

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
                className="relative group cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-300/50">
                    <Award size={18} className="text-yellow-900" />
                  </div>
                </div>

                <div className="absolute -bottom-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/80 to-amber-600/80 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xs font-bold text-yellow-900">✓</span>
                  </div>
                </div>

                <GlassPanel hover glow="gold" className="h-full flex flex-col relative overflow-visible">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="h-6 w-1 bg-gradient-to-b from-yellow-400/80 to-transparent rounded-full" />
                  </div>

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
                      <Award size={40} className="text-yellow-500/30" />
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
                        onClick={(e) => e.stopPropagation()}
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

      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-3 -right-3 z-20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-xl border-2 border-yellow-300/50">
                  <Award size={22} className="text-yellow-900" />
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(null)}
                className="absolute -top-2 -right-2 z-30 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-white/20 transition-all"
              >
                <X size={16} />
              </button>

              <div className="glass rounded-2xl p-0 overflow-hidden border border-yellow-500/20">
                {selectedCert.image && (
                  <div className="relative h-64 overflow-hidden bg-white/[0.02]">
                    <Image
                      src={selectedCert.image}
                      alt={selectedCert.name}
                      width={800}
                      height={400}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{selectedCert.name}</h3>
                    </div>
                  </div>
                )}

                {!selectedCert.image && (
                  <div className="relative h-32 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-yellow-600/10 flex items-center justify-center">
                    <Award size={48} className="text-yellow-500/40" />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {!selectedCert.image && (
                    <h3 className="text-2xl font-bold gradient-text">{selectedCert.name}</h3>
                  )}

                  <div className="flex items-center gap-2 text-foreground/50">
                    <Building2 size={16} className="text-yellow-500/60" />
                    <span>{selectedCert.organization}</span>
                  </div>

                  <div className="flex items-center gap-2 text-foreground/40">
                    <Calendar size={16} className="text-yellow-500/60" />
                    <span>
                      {new Date(selectedCert.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {selectedCert.description && (
                    <div className="pt-4 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-yellow-500/60" />
                        <span className="text-sm font-medium text-foreground/60">Description</span>
                      </div>
                      <p className="text-foreground/60 leading-relaxed">{selectedCert.description}</p>
                    </div>
                  )}

                  {selectedCert.pdfUrl && (
                    <div className="pt-4 border-t border-white/[0.05]">
                      <a
                        href={selectedCert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500/80 hover:text-yellow-400 hover:border-yellow-500/30 hover:from-yellow-500/15 hover:to-amber-500/15 transition-all"
                      >
                        <ExternalLink size={16} />
                        <span className="font-medium">View Full Certificate</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
