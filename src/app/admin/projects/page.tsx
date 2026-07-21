"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, ExternalLink, Upload, Loader2, FolderKanban, X, User, GraduationCap } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { compressImage } from "@/lib/image-compress";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string | null;
  images: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  technology: string[];
  category: string;
  subCategory: string | null;
  type: string;
  year: string | null;
  status: string;
  featured: boolean;
  order: number;
}

const categoryMap: Record<string, string[]> = {
  "Full Stack": ["Web App", "E-commerce", "Social Platform", "Dashboard", "CMS", "Portfolio", "SaaS"],
  "Frontend": ["SPA", "Landing Page", "UI Component Library", "Progressive Web App"],
  "Backend": ["REST API", "GraphQL API", "Microservices", "CLI Tool", "Serverless"],
  "AI/ML": ["NLP", "Computer Vision", "Chatbot", "Data Analysis", "Recommendation System", "Deep Learning"],
  "Mobile": ["Android", "iOS", "Cross-platform", "Flutter", "React Native"],
  "Desktop": ["Windows", "macOS", "Linux", "Cross-platform", "Electron"],
  "DevOps": ["CI/CD", "Docker/K8s", "Cloud Infrastructure", "Monitoring"],
  "Database": ["Design", "Migration", "Optimization"],
  "Other": ["Other"],
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMore, setIsUploadingMore] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    images: [] as string[],
    githubUrl: "",
    liveUrl: "",
    technology: "",
    category: "Full Stack",
    subCategory: "Web App",
    type: "personal",
    year: "",
    status: "active",
    featured: false,
    order: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        technology: formData.technology.split(",").map((t) => t.trim()),
        year: formData.type === "college" ? (formData.year || null) : null,
      };

      let res;
      if (editingProject) {
        res = await fetch("/api/admin/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProject.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast(editingProject ? "Project updated" : "Project created");
        await fetchProjects();
        closeModal();
      } else {
        toast("Failed to save project", "error");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast("Failed to save project", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== deleteId));
        toast("Project deleted");
      } else {
        toast("Failed to delete project", "error");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast("Failed to delete project", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        image: project.image || "",
        images: project.images || [],
        githubUrl: project.githubUrl || "",
        liveUrl: project.liveUrl || "",
        technology: project.technology.join(", "),
        category: project.category,
        subCategory: project.subCategory || "",
        type: project.type || "personal",
        year: project.year || "",
        status: project.status,
        featured: project.featured,
        order: project.order,
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        image: "",
        images: [],
        githubUrl: "",
        liveUrl: "",
        technology: "",
        category: "Full Stack",
        subCategory: "Web App",
        type: "personal",
        year: "",
        status: "active",
        featured: false,
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "image" | "images") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (target === "image") setIsUploadingCover(true);
    else setIsUploadingMore(true);
    try {
      const compressed = await compressImage(file, 800, 0.7);
      if (target === "image") {
        setFormData((prev) => ({ ...prev, image: compressed }));
      } else {
        setFormData((prev) => ({ ...prev, images: [...prev.images, compressed] }));
      }
      toast("Image uploaded");
    } catch {
      toast("Upload failed", "error");
    }
    if (target === "image") setIsUploadingCover(false);
    else setIsUploadingMore(false);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Projects</h1>
          <p className="text-foreground/60 mt-1">Manage your portfolio projects</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <GlassPanel className="text-center py-16">
          <FolderKanban size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="text-foreground/60">No projects yet. Create your first project!</p>
        </GlassPanel>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <GlassPanel hover className="h-full flex flex-col group">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <div className="flex items-center gap-1.5">
                        {project.type === "college" && project.year && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20">
                            {project.year}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/20"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        project.type === "college"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/15"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/15"
                      }`}>
                        {project.type === "college" ? <GraduationCap size={12} /> : <User size={12} />}
                        {project.type === "college" ? "College" : "Personal"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technology.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-white/5 rounded-lg text-xs border border-white/5">
                          {tech}
                        </span>
                      ))}
                      {project.technology.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 rounded-lg text-xs border border-white/5">
                          +{project.technology.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-1">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-foreground transition-colors">
                          <GithubIcon size={16} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-foreground transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(project)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-foreground/40 hover:text-primary transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(project.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
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
        title={editingProject ? "Edit Project" : "Add Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image <span className="text-red-400">*</span>
            </label>
            {formData.image ? (
              <div className="relative inline-block">
                <Image src={formData.image} alt="Preview" width={800} height={160} unoptimized className="w-full h-40 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                {isUploadingCover ? <Loader2 size={32} className="text-foreground/30 mb-2 animate-spin" /> : <Upload size={32} className="text-foreground/30 mb-2" />}
                <span className="text-sm text-foreground/40">{isUploadingCover ? "Uploading..." : "Click to upload cover image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image")}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Images <span className="text-foreground/40">(up to 3, optional)</span>
            </label>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <Image src={img} alt={`Image ${i + 1}`} width={400} height={96} unoptimized className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white/70">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {formData.images.length < 3 && (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                {isUploadingMore ? <Loader2 size={20} className="text-foreground/30 mb-1 animate-spin" /> : <Upload size={20} className="text-foreground/30 mb-1" />}
                <span className="text-xs text-foreground/40">{isUploadingMore ? "Uploading..." : `Add image (${formData.images.length}/3)`}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "images")}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GitHub URL"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
            <Input
              label="Live URL"
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <Input
            label="Technologies (comma-separated)"
            value={formData.technology}
            onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
            placeholder="React, Node.js, PostgreSQL"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, year: e.target.value === "personal" ? "" : formData.year })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors"
              >
                <option value="personal">Personal</option>
                <option value="college">College</option>
              </select>
            </div>
            {formData.type === "college" && (
              <Input
                label="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g. 1st year, 2nd year, 3rd year, Final year"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                list="category-options"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Full Stack, Mobile, Custom..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors"
              />
              <datalist id="category-options">
                {Object.keys(categoryMap).map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sub Category</label>
              <input
                type="text"
                list="subcategory-options"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                placeholder="e.g. Web App, Chatbot, Custom..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors"
              />
              <datalist id="subcategory-options">
                {(categoryMap[formData.category] || []).map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-white/20"
            />
            <label htmlFor="featured" className="text-sm">Featured Project</label>
          </div>
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
                editingProject ? "Update" : "Create"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
