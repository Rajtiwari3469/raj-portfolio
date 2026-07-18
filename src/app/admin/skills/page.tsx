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
      { name: "HTML5", color: "#e34f26" },
      { name: "CSS3", color: "#1572b6" },
      { name: "JavaScript", color: "#f7df1e" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "React.js", color: "#61dafb" },
      { name: "Next.js", color: "#ffffff" },
      { name: "Vue.js", color: "#42b883" },
      { name: "Nuxt.js", color: "#00dc82" },
      { name: "Angular", color: "#dd0031" },
      { name: "Svelte", color: "#ff3e00" },
      { name: "SvelteKit", color: "#ff3e00" },
      { name: "Tailwind CSS", color: "#06b6d4" },
      { name: "Bootstrap", color: "#7952b3" },
      { name: "Material UI", color: "#007fff" },
      { name: "Ant Design", color: "#0170fe" },
      { name: "Chakra UI", color: "#319795" },
      { name: "Shadcn/UI", color: "#ffffff" },
      { name: "Radix UI", color: "#161618" },
      { name: "Framer Motion", color: "#bb4bff" },
      { name: "GSAP", color: "#88ce02" },
      { name: "Three.js", color: "#ffffff" },
      { name: "React Three Fiber", color: "#61dafb" },
      { name: "Anime.js", color: "#ffffff" },
      { name: "Lottie", color: "#00ddb3" },
      { name: "AOS", color: "#ffffff" },
      { name: "Redux Toolkit", color: "#764abc" },
      { name: "Zustand", color: "#443e38" },
      { name: "Recoil", color: "#3578e5" },
      { name: "MobX", color: "#ff9955" },
      { name: "Context API", color: "#61dafb" },
      { name: "Jotai", color: "#1a1a2e" },
      { name: "Axios", color: "#5a29e4" },
      { name: "React Query", color: "#ff4e50" },
      { name: "SWR", color: "#ffffff" },
      { name: "Sass", color: "#cc6699" },
      { name: "Sass/SCSS", color: "#cc6699" },
    ],
    Backend: [
      { name: "Node.js", color: "#339933" },
      { name: "Express.js", color: "#ffffff" },
      { name: "NestJS", color: "#e0234e" },
      { name: "Fastify", color: "#000000" },
      { name: "Django", color: "#092e20" },
      { name: "Flask", color: "#ffffff" },
      { name: "FastAPI", color: "#009688" },
      { name: "Spring Boot", color: "#6db33f" },
      { name: "Laravel", color: "#ff2d20" },
      { name: "ASP.NET Core", color: "#512bd4" },
      { name: "Gin", color: "#00add8" },
      { name: "Fiber", color: "#00add8" },
      { name: "Python", color: "#3776ab" },
      { name: "Java", color: "#ed8b00" },
      { name: "C#", color: "#68217a" },
      { name: "PHP", color: "#777bb4" },
      { name: "Go", color: "#00add8" },
      { name: "Rust", color: "#dea584" },
      { name: "Kotlin", color: "#7f52ff" },
      { name: "Ruby", color: "#cc342d" },
      { name: "JWT", color: "#000000" },
      { name: "OAuth 2.0", color: "#4285f4" },
      { name: "Firebase Auth", color: "#ffca28" },
      { name: "Clerk", color: "#6c47ff" },
      { name: "Auth.js", color: "#ffffff" },
      { name: "Passport.js", color: "#34a853" },
      { name: "Socket.IO", color: "#010101" },
      { name: "WebSocket", color: "#3578e5" },
      { name: "SignalR", color: "#512bd4" },
      { name: "bcrypt", color: "#ffffff" },
      { name: "REST API", color: "#009688" },
      { name: "GraphQL", color: "#e10098" },
      { name: "gRPC", color: "#00b0ad" },
      { name: "Nodemailer", color: "#ffffff" },
      { name: "SendGrid", color: "#1a82e2" },
      { name: "Twilio", color: "#f22f46" },
    ],
    Database: [
      { name: "MySQL", color: "#4479a1" },
      { name: "PostgreSQL", color: "#4169e1" },
      { name: "MariaDB", color: "#003545" },
      { name: "SQLite", color: "#003b57" },
      { name: "Microsoft SQL Server", color: "#cc2927" },
      { name: "Oracle Database", color: "#f80000" },
      { name: "MongoDB", color: "#47a248" },
      { name: "Firebase Firestore", color: "#ffca28" },
      { name: "Redis", color: "#dc382d" },
      { name: "Cassandra", color: "#1287b1" },
      { name: "CouchDB", color: "#eb2429" },
      { name: "DynamoDB", color: "#4053d6" },
      { name: "Elasticsearch", color: "#005571" },
      { name: "RabbitMQ", color: "#ff6600" },
      { name: "Apache Kafka", color: "#231f20" },
      { name: "Prisma", color: "#2d3748" },
      { name: "Sequelize", color: "#52b0e7" },
      { name: "TypeORM", color: "#e0234e" },
      { name: "Mongoose", color: "#88aa11" },
      { name: "Drizzle ORM", color: "#c5f74f" },
      { name: "Supabase", color: "#3ecf8e" },
    ],
    Tools: [
      { name: "Vercel", color: "#000000" },
      { name: "Netlify", color: "#00c7b7" },
      { name: "Railway", color: "#0b0b09" },
      { name: "Render", color: "#46e3b7" },
      { name: "DigitalOcean", color: "#0080ff" },
      { name: "AWS", color: "#ff9900" },
      { name: "Google Cloud", color: "#4285f4" },
      { name: "Microsoft Azure", color: "#0078d4" },
      { name: "Cloudflare", color: "#f38020" },
      { name: "Cloudinary", color: "#3448c5" },
      { name: "Firebase Storage", color: "#ffca28" },
      { name: "AWS S3", color: "#ff9900" },
      { name: "ImageKit", color: "#2b8aff" },
      { name: "UploadThing", color: "#6d28d9" },
      { name: "Multer", color: "#ffffff" },
      { name: "Docker", color: "#2496ed" },
      { name: "Docker Compose", color: "#2496ed" },
      { name: "Kubernetes", color: "#326ce5" },
      { name: "Git", color: "#f05032" },
      { name: "GitHub", color: "#ffffff" },
      { name: "GitLab", color: "#fc6d26" },
      { name: "Bitbucket", color: "#0052cc" },
      { name: "GitHub Actions", color: "#2088ff" },
      { name: "GitLab CI/CD", color: "#fc6d26" },
      { name: "Jenkins", color: "#d33833" },
      { name: "CircleCI", color: "#343434" },
      { name: "Postman", color: "#ff6c37" },
      { name: "Insomnia", color: "#4000bf" },
      { name: "Thunder Client", color: "#6c5ce7" },
      { name: "VS Code", color: "#007acc" },
      { name: "IntelliJ IDEA", color: "#fe315d" },
      { name: "Android Studio", color: "#3ddc84" },
      { name: "WebStorm", color: "#07c3f2" },
      { name: "Sublime Text", color: "#ff9800" },
      { name: "Vite", color: "#646cff" },
      { name: "Webpack", color: "#8dd6f9" },
      { name: "Parcel", color: "#1a1a1a" },
      { name: "Turbopack", color: "#ffffff" },
      { name: "Rollup", color: "#ef3335" },
      { name: "npm", color: "#cb3837" },
      { name: "pnpm", color: "#f69220" },
      { name: "Yarn", color: "#2c8ebb" },
      { name: "Bun", color: "#fbf0df" },
      { name: "Nginx", color: "#009639" },
      { name: "Apache", color: "#d22128" },
      { name: "PM2", color: "#2b038a" },
      { name: "Linux", color: "#fcc624" },
      { name: "Sentry", color: "#362d59" },
      { name: "Grafana", color: "#f46800" },
      { name: "Prometheus", color: "#e6522c" },
      { name: "New Relic", color: "#1ce783" },
      { name: "Figma", color: "#f24e1e" },
      { name: "Adobe XD", color: "#ff61f6" },
      { name: "Sketch", color: "#fdb300" },
      { name: "Canva", color: "#00c4cc" },
      { name: "Photoshop", color: "#31a8ff" },
      { name: "Illustrator", color: "#ff9a00" },
      { name: "Blender", color: "#ea7600" },
      { name: "Spline", color: "#ffffff" },
      { name: "Rive", color: "#00ffaa" },
      { name: "React Native", color: "#61dafb" },
      { name: "Flutter", color: "#02569b" },
      { name: "Ionic", color: "#3880ff" },
      { name: "OpenAI API", color: "#10a37f" },
      { name: "Google Gemini", color: "#1a73e8" },
      { name: "Claude API", color: "#d97757" },
      { name: "TensorFlow", color: "#ff6f00" },
      { name: "PyTorch", color: "#ee4c2c" },
      { name: "LangChain", color: "#ffffff" },
      { name: "Ollama", color: "#ffffff" },
      { name: "Jest", color: "#c21325" },
      { name: "Vitest", color: "#6e9f18" },
      { name: "Cypress", color: "#172221" },
      { name: "Playwright", color: "#2ead33" },
      { name: "React Testing Library", color: "#e33332" },
      { name: "Mocha", color: "#8d6748" },
      { name: "PyTest", color: "#0a9edc" },
      { name: "Google Analytics", color: "#e37400" },
      { name: "Lighthouse", color: "#ffffff" },
      { name: "WebRTC", color: "#ffffff" },
      { name: "Razorpay", color: "#072654" },
      { name: "Stripe", color: "#635bff" },
      { name: "PayPal", color: "#003087" },
      { name: "Firebase", color: "#ffca28" },
      { name: "Supabase", color: "#3ecf8e" },
      { name: "Appwrite", color: "#fd366e" },
      { name: "PocketBase", color: "#ef8236" },
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
