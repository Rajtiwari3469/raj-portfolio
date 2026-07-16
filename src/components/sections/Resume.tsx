"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, FileText } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";

interface Resume {
  id: string;
  name: string;
  content: string;
  pdfUrl: string | null;
  candidatePhoto: string | null;
  active: boolean;
  createdAt: string;
}

export default function ResumeSection() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/resume")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setResumes(data);
          setSelectedResume(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  if (resumes.length === 0) return null;

  return (
    <section id="resume" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Resume</span>
          </h2>
          <p className="text-foreground/40 tracking-wide">View or download my resume</p>
        </motion.div>

        {selectedResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            <GlassPanel className="max-w-4xl mx-auto border border-white/[0.06]">
              <div className="flex flex-col md:flex-row gap-6">
                {selectedResume.candidatePhoto && (
                  <div className="flex-shrink-0">
                    <img
                      src={selectedResume.candidatePhoto}
                      alt={selectedResume.name}
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-primary/20 shadow-[0_0_20px_rgba(0,212,255,0.1)]"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{selectedResume.name}</h3>
                  <p className="text-foreground/40 text-sm mb-4">
                    Last updated: {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </p>

                  {selectedResume.pdfUrl ? (
                    <p className="text-sm text-foreground/40 mb-4">PDF resume available for download</p>
                  ) : selectedResume.content ? (
                    <div className="text-sm text-foreground/50 line-clamp-4 mb-4 whitespace-pre-wrap">
                      {selectedResume.content.substring(0, 300)}...
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                      className="flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Resume
                    </Button>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {showPreview && selectedResume && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050510]/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <GlassPanel className="relative border border-white/[0.08] shadow-[0_0_60px_rgba(0,212,255,0.08)]">
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 text-foreground/40 hover:text-foreground text-xl z-10"
                >
                  x
                </button>

                {selectedResume.candidatePhoto && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedResume.candidatePhoto}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]"
                    />
                  </div>
                )}

                <h2 className="text-xl font-bold text-center mb-4">{selectedResume.name}</h2>

                {selectedResume.pdfUrl ? (
                  <iframe
                    src={selectedResume.pdfUrl}
                    className="w-full h-[500px] rounded-xl border border-white/[0.08]"
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-sm text-foreground/70 bg-white/[0.02] p-6 rounded-xl border border-white/[0.05] max-h-[500px] overflow-y-auto">
                    {selectedResume.content}
                  </div>
                )}

                <div className="flex gap-3 mt-4 justify-center">
                  <Button variant="ghost" onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
