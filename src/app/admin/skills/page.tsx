"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Programming",
    level: 80,
    icon: "",
    order: 0,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        icon: formData.icon || null,
      };

      if (editingSkill) {
        await fetch("/api/admin/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSkill.id, ...payload }),
        });
      } else {
        await fetch("/api/admin/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchSkills();
      closeModal();
    } catch (error) {
      console.error("Failed to save skill:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
      fetchSkills();
    } catch (error) {
      console.error("Failed to delete skill:", error);
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
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-foreground/60 mt-1">Manage your skills and expertise</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Add Skill
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading skills...</div>
      ) : skills.length === 0 ? (
        <GlassPanel className="text-center py-12">
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
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <GlassPanel hover className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{skill.name}</h3>
                            <div className="mt-2 h-2 bg-glass-bg rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                            <p className="text-xs text-foreground/60 mt-1">{skill.level}%</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => openModal(skill)}
                              className="p-2 rounded-lg hover:bg-primary/20 text-primary"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(skill.id)}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
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
              className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border"
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
              className="w-full"
            />
          </div>
          <Input
            label="Icon (optional)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Icon name or URL"
          />
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
            <Button type="submit" variant="primary">
              {editingSkill ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
