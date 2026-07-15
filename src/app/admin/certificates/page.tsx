"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Award } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface Certificate {
  id: string;
  name: string;
  organization: string;
  date: string;
  image: string | null;
  pdfUrl: string | null;
  description: string | null;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    date: "",
    image: "",
    pdfUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/admin/certificates");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        image: formData.image || null,
        pdfUrl: formData.pdfUrl || null,
        description: formData.description || null,
      };

      if (editingCert) {
        await fetch("/api/admin/certificates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCert.id, ...payload }),
        });
      } else {
        await fetch("/api/admin/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchCertificates();
      closeModal();
    } catch (error) {
      console.error("Failed to save certificate:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      await fetch(`/api/admin/certificates?id=${id}`, { method: "DELETE" });
      fetchCertificates();
    } catch (error) {
      console.error("Failed to delete certificate:", error);
    }
  };

  const openModal = (cert?: Certificate) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        name: cert.name,
        organization: cert.organization,
        date: new Date(cert.date).toISOString().split("T")[0],
        image: cert.image || "",
        pdfUrl: cert.pdfUrl || "",
        description: cert.description || "",
      });
    } else {
      setEditingCert(null);
      setFormData({
        name: "",
        organization: "",
        date: "",
        image: "",
        pdfUrl: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-foreground/60 mt-1">Manage your certifications</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Certificate
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <p className="text-foreground/60">No certificates yet. Add your first certificate!</p>
        </GlassPanel>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {certificates.map((cert) => (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <GlassPanel hover className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gold/20 text-gold">
                      <Award size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{cert.name}</h3>
                      <p className="text-sm text-foreground/60">{cert.organization}</p>
                    </div>
                  </div>

                  {cert.description && (
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                      {cert.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <p className="text-xs text-foreground/50 mb-4">
                      {new Date(cert.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                      <div className="flex gap-2">
                        {cert.pdfUrl && (
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            View PDF
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(cert)}
                          className="p-2 rounded-lg hover:bg-primary/20 text-primary"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCert ? "Edit Certificate" : "Add Certificate"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Certificate Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Organization"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            required
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Image URL (optional)"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />
          <Input
            label="PDF URL (optional)"
            value={formData.pdfUrl}
            onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
            placeholder="https://..."
          />
          <Textarea
            label="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCert ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
