"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Award, Upload, X, Loader2, FileText } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { compressImage } from "@/lib/image-compress";

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
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    date: "",
    image: "",
    pdfUrl: "",
    description: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCertificates();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 800, 0.7);
      setFormData({ ...formData, image: compressed });
      setImagePreview(compressed);
      toast("Image uploaded");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        image: formData.image || null,
        pdfUrl: formData.pdfUrl || null,
        description: formData.description || null,
      };

      let res;
      if (editingCert) {
        res = await fetch("/api/admin/certificates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCert.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast(editingCert ? "Certificate updated" : "Certificate created");
        await fetchCertificates();
        closeModal();
      } else {
        toast("Failed to save certificate", "error");
      }
    } catch (error) {
      console.error("Failed to save certificate:", error);
      toast("Failed to save certificate", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/certificates?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setCertificates((prev) => prev.filter((c) => c.id !== deleteId));
        toast("Certificate deleted");
      } else {
        toast("Failed to delete certificate", "error");
      }
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast("Failed to delete certificate", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
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
      setImagePreview(cert.image || null);
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
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Certificates</h1>
          <p className="text-foreground/60 mt-1">Manage your certifications</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Certificate
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <GlassPanel className="text-center py-16">
          <Award size={48} className="mx-auto mb-4 text-foreground/20" />
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
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <GlassPanel hover className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-yellow-500/10 text-gold border border-yellow-500/10">
                      <Award size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
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

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        {cert.pdfUrl && (
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            View PDF
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(cert)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-foreground/40 hover:text-primary transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(cert.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
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
          <div>
            <label className="block text-sm font-medium mb-2">Certificate Image</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={128}
                  height={128}
                  unoptimized
                  className="w-32 h-32 object-cover rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                {isUploading ? <Loader2 size={24} className="text-foreground/30 mb-2 animate-spin" /> : <Upload size={24} className="text-foreground/30 mb-2" />}
                <span className="text-sm text-foreground/40">{isUploading ? "Uploading..." : "Click to upload image"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">PDF File (optional)</label>
            {formData.pdfUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
                <FileText size={20} className="text-green-400" />
                <span className="text-sm text-green-400 flex-1">PDF uploaded</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pdfUrl: "" })}
                  className="text-red-400 text-sm hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                <Upload size={20} className="text-foreground/30 mb-1" />
                <span className="text-xs text-foreground/40">Click to upload PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      setFormData({ ...formData, pdfUrl: data.url });
                      toast("PDF uploaded");
                    } else {
                      toast("Upload failed", "error");
                    }
                    setIsUploading(false);
                  }}
                />
              </label>
            )}
          </div>
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
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                editingCert ? "Update" : "Create"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
