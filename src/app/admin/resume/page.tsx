"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Upload, FileText, Eye, Download, Loader2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface Resume {
  id: string;
  name: string;
  content: string;
  pdfUrl: string | null;
  candidatePhoto: string | null;
  active: boolean;
  createdAt: string;
}

export default function ResumePage() {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "upload">("write");
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    pdfUrl: "",
    candidatePhoto: "",
    active: true,
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/admin/resume");
      if (res.ok) {
        const data = await res.json();
        setResumes(Array.isArray(data) ? data : []);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResumes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        content: activeTab === "write" ? formData.content : "",
        pdfUrl: activeTab === "upload" ? formData.pdfUrl : null,
      };

      let res;
      if (editingResume) {
        res = await fetch("/api/admin/resume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingResume.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res?.ok) {
        toast(editingResume ? "Resume updated" : "Resume created");
        await fetchResumes();
        closeModal();
      } else {
        toast("Failed to save resume", "error");
      }
    } catch {
      toast("Failed to save resume", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/resume?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== deleteId));
        toast("Resume deleted");
      } else {
        toast("Failed to delete resume", "error");
      }
    } catch {
      toast("Failed to delete resume", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const openModal = (resume?: Resume) => {
    if (resume) {
      setEditingResume(resume);
      setFormData({
        name: resume.name,
        content: resume.content || "",
        pdfUrl: resume.pdfUrl || "",
        candidatePhoto: resume.candidatePhoto || "",
        active: resume.active,
      });
      setActiveTab(resume.pdfUrl ? "upload" : "write");
    } else {
      setEditingResume(null);
      setFormData({ name: "", content: "", pdfUrl: "", candidatePhoto: "", active: true });
      setActiveTab("write");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResume(null);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
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
    } catch {
      toast("Upload failed", "error");
    }
    setUploadingPdf(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, candidatePhoto: data.url });
        toast("Photo uploaded");
      } else {
        toast("Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    }
    setUploadingPhoto(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Resume</h1>
          <p className="text-foreground/60 mt-1">Upload PDF or write resume content</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Resume
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : resumes.length === 0 ? (
        <GlassPanel className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="text-foreground/60">No resumes yet</p>
        </GlassPanel>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              >
                <GlassPanel className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {resume.candidatePhoto ? (
                        <Image src={resume.candidatePhoto} alt="" width={48} height={48} unoptimized className="w-12 h-12 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                          <FileText size={20} className="text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{resume.name}</h3>
                        <p className="text-xs text-foreground/50">
                          {resume.pdfUrl ? "PDF Upload" : "Written"} · {resume.active ? (
                            <span className="text-green-400">Active</span>
                          ) : (
                            <span className="text-foreground/40">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {resume.content && (
                    <p className="text-sm text-foreground/60 line-clamp-3 mb-3">{resume.content.substring(0, 200)}...</p>
                  )}

                  <div className="flex gap-1 mt-auto pt-3 border-t border-white/5">
                    <button
                      onClick={() => setPreviewResume(resume)}
                      className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-primary transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    {resume.pdfUrl && (
                      <a
                        href={resume.pdfUrl}
                        download
                        className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-primary transition-colors"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => openModal(resume)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-foreground/40 hover:text-primary ml-auto transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(resume.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingResume ? "Edit Resume" : "Add Resume"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Resume Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Raj Tiwari - Resume 2025"
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Candidate Photo (for Digital CV)</label>
            {formData.candidatePhoto ? (
              <div className="relative inline-block">
                <Image src={formData.candidatePhoto} alt="" width={80} height={80} unoptimized className="w-20 h-20 rounded-full object-cover border border-white/10" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, candidatePhoto: "" })}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  x
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                {uploadingPhoto ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                <span className="text-sm">{uploadingPhoto ? "Uploading..." : "Upload photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>

          <div className="flex gap-2 border-b border-white/5 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === "write" ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground/80"
              }`}
            >
              Write Resume
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === "upload" ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground/80"
              }`}
            >
              Upload PDF
            </button>
          </div>

          {activeTab === "write" ? (
            <Textarea
              label="Resume Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your resume content here..."
              rows={12}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">PDF File</label>
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
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                  {uploadingPdf ? <Loader2 size={24} className="text-foreground/40 mb-2 animate-spin" /> : <Upload size={24} className="text-foreground/40 mb-2" />}
                  <span className="text-sm text-foreground/40">{uploadingPdf ? "Uploading..." : "Click to upload PDF"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                </label>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm">Active (shown on portfolio)</label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                editingResume ? "Update" : "Create"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <AnimatePresence>
        {previewResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setPreviewResume(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="relative">
                <button
                  onClick={() => setPreviewResume(null)}
                  className="absolute top-4 right-4 text-foreground/40 hover:text-foreground text-xl transition-colors"
                >
                  x
                </button>
                <h2 className="text-xl font-bold mb-4">{previewResume.name}</h2>
                {previewResume.candidatePhoto && (
                  <Image src={previewResume.candidatePhoto} alt="" width={96} height={96} unoptimized className="w-24 h-24 rounded-full object-cover mb-4 border border-white/10" />
                )}
                {previewResume.pdfUrl ? (
                  <iframe src={previewResume.pdfUrl} className="w-full h-[600px] rounded-xl" />
                ) : (
                  <div className="whitespace-pre-wrap text-sm text-foreground/80 bg-white/5 p-4 rounded-xl border border-white/5">
                    {previewResume.content}
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" onClick={() => setPreviewResume(null)}>Close</Button>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
