"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Loader2, Code2, Upload, X } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
}

export default function SkillsPage() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Programming",
    level: 50,
    icon: "",
    order: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/admin/skills");
      const data = await response.json();
      if (Array.isArray(data)) {
        setSkills(data);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSkills();
  }, []);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, icon: data.url });
        toast("Icon uploaded");
      } else {
        toast("Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    }
    setIsUploadingIcon(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        icon: formData.icon || null,
      };

      let res;
      if (editingSkill) {
        res = await fetch("/api/admin/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSkill.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast(editingSkill ? "Skill updated" : "Skill created");
        await fetchSkills();
        closeModal();
      } else {
        toast("Failed to save skill", "error");
      }
    } catch (error) {
      console.error("Failed to save skill:", error);
      toast("Failed to save skill", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/skills?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== deleteId));
        toast("Skill deleted");
      } else {
        toast("Failed to delete skill", "error");
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
      toast("Failed to delete skill", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const openModal = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        icon: skill.icon || "",
        order: skill.order,
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: "",
        category: "Programming",
        level: 80,
        icon: "",
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Skills</h1>
          <p className="text-foreground/60 mt-1">Manage your skills and expertise</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Skill
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : skills.length === 0 ? (
        <GlassPanel className="text-center py-16">
          <Code2 size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="text-foreground/60">No skills yet. Add your first skill!</p>
        </GlassPanel>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 gradient-text">{category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {skills
                    .filter((s) => s.category === category)
                    .map((skill) => (
                      <motion.div
                        key={skill.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      >
                        <GlassPanel hover className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{skill.name}</h3>
                            <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              />
                            </div>
                            <p className="text-xs text-foreground/60 mt-1">{skill.level}%</p>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <button
                              onClick={() => openModal(skill)}
                              className="p-2 rounded-lg hover:bg-primary/10 text-foreground/40 hover:text-primary transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteId(skill.id)}
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
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSkill ? "Edit Skill" : "Add Skill"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Skill Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors"
            >
              <option value="Programming">Programming</option>
              <option value="Framework">Framework</option>
              <option value="Database">Database</option>
              <option value="Tool">Tool</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Level: {formData.level}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon (optional)</label>
            {formData.icon ? (
              <div className="relative inline-block">
                <Image
                  src={formData.icon}
                  alt="Icon"
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 object-cover rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: "" })}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                {isUploadingIcon ? <Loader2 size={20} className="text-foreground/30 mb-1 animate-spin" /> : <Upload size={20} className="text-foreground/30 mb-1" />}
                <span className="text-xs text-foreground/40">{isUploadingIcon ? "Uploading..." : "Click to upload icon"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <Input
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
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
                editingSkill ? "Update" : "Create"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
