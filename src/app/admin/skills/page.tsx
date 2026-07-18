"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Loader2, Code2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

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
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        level: formData.level,
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
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: "",
        category: "Frontend",
        level: 80,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  const categories = [...new Set(skills.map((s) => s.category))];

  const skillNamesByCategory: Record<string, { name: string; color: string }[]> = {
    Frontend: [
      { name: "HTML", color: "#e34f26" },
      { name: "CSS", color: "#1572b6" },
      { name: "Sass", color: "#cc6699" },
      { name: "React", color: "#61dafb" },
      { name: "Next.js", color: "#ffffff" },
      { name: "Vue.js", color: "#42b883" },
      { name: "Angular", color: "#dd0031" },
      { name: "Svelte", color: "#ff3e00" },
      { name: "Tailwind CSS", color: "#06b6d4" },
      { name: "Bootstrap", color: "#7952b3" },
    ],
    Backend: [
      { name: "JavaScript", color: "#f7df1e" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "Python", color: "#3776ab" },
      { name: "Java", color: "#ed8b00" },
      { name: "C++", color: "#00599c" },
      { name: "C#", color: "#68217a" },
      { name: "Go", color: "#00add8" },
      { name: "Rust", color: "#dea584" },
      { name: "PHP", color: "#777bb4" },
      { name: "Ruby", color: "#cc342d" },
      { name: "Swift", color: "#f05138" },
      { name: "Kotlin", color: "#7f52ff" },
      { name: "Dart", color: "#0175c2" },
      { name: "Scala", color: "#dc322f" },
      { name: "R", color: "#276dc3" },
      { name: "MATLAB", color: "#e16737" },
      { name: "Shell/Bash", color: "#4eaa25" },
      { name: "Node.js", color: "#339933" },
      { name: "Django", color: "#092e20" },
      { name: "Flask", color: "#ffffff" },
      { name: "Spring Boot", color: "#6db33f" },
      { name: "Express.js", color: "#ffffff" },
    ],
    Database: [
      { name: "SQL", color: "#e38c00" },
      { name: "MongoDB", color: "#47a248" },
      { name: "PostgreSQL", color: "#4169e1" },
      { name: "MySQL", color: "#4479a1" },
      { name: "Redis", color: "#dc382d" },
      { name: "Firebase", color: "#ffca28" },
    ],
    Tools: [
      { name: "Docker", color: "#2496ed" },
      { name: "Kubernetes", color: "#326ce5" },
      { name: "AWS", color: "#ff9900" },
      { name: "Git", color: "#f05032" },
      { name: "Figma", color: "#f24e1e" },
      { name: "Photoshop", color: "#31a8ff" },
      { name: "Illustrator", color: "#ff9a00" },
      { name: "Other", color: "#888888" },
    ],
  };

  const categoryOptions = [
    { name: "Frontend", color: "#61dafb" },
    { name: "Backend", color: "#339933" },
    { name: "Database", color: "#4169e1" },
    { name: "Tools", color: "#ff9900" },
  ];

  const allSkillNames = Object.values(skillNamesByCategory).flat();
  const getSkillColor = (name: string) => allSkillNames.find((s) => s.name === name)?.color || "#888888";
  const getCategoryColor = (name: string) => categoryOptions.find((c) => c.name === name)?.color || "#888888";
  const getSkillsForCategory = (cat: string) => skillNamesByCategory[cat] || [];

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
              <h2 className="text-xl font-semibold mb-4" style={{ color: getCategoryColor(category) }}>{category}</h2>
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
          <div>
            <label className="block text-sm font-medium mb-2">Skill Name</label>
            <div className="relative">
              <select
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors appearance-none"
                style={{ color: getSkillColor(formData.name) }}
                required
              >
                <option value="" disabled style={{ background: "#0a0a1f", color: "#555" }}>Select a skill</option>
                {getSkillsForCategory(formData.category).map((skill) => (
                  <option key={skill.name} value={skill.name} style={{ color: skill.color, background: "#0a0a1f" }}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-foreground/30 rotate-45" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, name: "" })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/30 focus:outline-none transition-colors appearance-none"
                style={{ color: getCategoryColor(formData.category) }}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.name} value={cat.name} style={{ color: cat.color, background: "#0a0a1f" }}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-foreground/30 rotate-45" />
              </div>
            </div>
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
