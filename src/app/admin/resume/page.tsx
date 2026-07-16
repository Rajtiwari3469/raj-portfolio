"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Upload, FileText, Eye, Download } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";

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
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
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
    fetchResumes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        content: activeTab === "write" ? formData.content : "",
        pdfUrl: activeTab === "upload" ? formData.pdfUrl : null,
      };

      if (editingResume) {
        await fetch("/api/admin/resume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingResume.id, ...payload }),
        });
      } else {
        await fetch("/api/admin/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchResumes();
      closeModal();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/resume?id=${deleteId}`, { method: "DELETE" });
      fetchResumes();
    } catch {} finally {
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
      }
    } catch {}
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
      }
    } catch {}
    setUploadingPhoto(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume</h1>
          <p className="text-foreground/60 mt-1">Upload PDF or write resume content</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Resume
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-foreground/40">Loading...</p>
      ) : resumes.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-foreground/30" />
          <p className="text-foreground/60">No resumes yet</p>
        </GlassPanel>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {resumes.map((resume) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassPanel className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {resume.candidatePhoto ? (
                      <img src={resume.candidatePhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <FileText size={20} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{resume.name}</h3>
                      <p className="text-xs text-foreground/50">
                        {resume.pdfUrl ? "PDF Upload" : "Written"} · {resume.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>

                {resume.content && (
                  <p className="text-sm text-foreground/60 line-clamp-3 mb-3">{resume.content.substring(0, 200)}...</p>
                )}

                <div className="flex gap-2 mt-auto pt-3 border-t border-glass-border">
                  <button
                    onClick={() => setPreviewResume(resume)}
                    className="p-2 rounded-lg hover:bg-white/5 text-foreground/60 hover:text-primary"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                  {resume.pdfUrl && (
                    <a
                      href={resume.pdfUrl}
                      download
                      className="p-2 rounded-lg hover:bg-white/5 text-foreground/60 hover:text-primary"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => openModal(resume)}
                    className="p-2 rounded-lg hover:bg-primary/20 text-primary ml-auto"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(resume.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
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
                <img src={formData.candidatePhoto} alt="" className="w-20 h-20 rounded-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, candidatePhoto: "" })}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <Upload size={18} />
                <span className="text-sm">{uploadingPhoto ? "Uploading..." : "Upload photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>

          <div className="flex gap-2 border-b border-glass-border mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "write" ? "border-primary text-primary" : "border-transparent text-foreground/60"
              }`}
            >
              Write Resume
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "upload" ? "border-primary text-primary" : "border-transparent text-foreground/60"
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
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <FileText size={20} className="text-green-400" />
                  <span className="text-sm text-green-400 flex-1">PDF uploaded</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pdfUrl: "" })}
                    className="text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload size={24} className="text-foreground/40 mb-2" />
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
            <Button type="submit" variant="primary">{editingResume ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <GlassPanel className="relative">
              <button
                onClick={() => setPreviewResume(null)}
                className="absolute top-4 right-4 text-foreground/40 hover:text-foreground text-xl"
              >
                x
              </button>
              <h2 className="text-xl font-bold mb-4">{previewResume.name}</h2>
              {previewResume.candidatePhoto && (
                <img src={previewResume.candidatePhoto} alt="" className="w-24 h-24 rounded-full object-cover mb-4" />
              )}
              {previewResume.pdfUrl ? (
                <iframe src={previewResume.pdfUrl} className="w-full h-[600px] rounded-xl" />
              ) : (
                <div className="whitespace-pre-wrap text-sm text-foreground/80 bg-white/5 p-4 rounded-xl">
                  {previewResume.content}
                </div>
              )}
              <div className="flex gap-3 mt-4">
                {previewResume.pdfUrl && (
                  <a href={previewResume.pdfUrl} download className="flex items-center gap-2">
                    <Button variant="primary"><Download size={16} /> Download PDF</Button>
                  </a>
                )}
                <Button variant="ghost" onClick={() => setPreviewResume(null)}>Close</Button>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      )}

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
