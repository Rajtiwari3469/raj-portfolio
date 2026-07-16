"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Layers,
  GraduationCap,
  Briefcase,
  Save,
  Plus,
  Trash2,
  Camera,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface AboutContent {
  bio: string[];
  careerGoals: string[];
}

interface TechStackContent {
  tags: string[];
}

interface EducationEntry {
  title: string;
  subtitle: string;
  institution: string;
  year: string;
  description: string;
  highlights: string[];
}

interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

const defaultAbout: AboutContent = {
  bio: [""],
  careerGoals: [""],
};

const defaultTechStack: TechStackContent = {
  tags: [""],
};

const defaultEducation: EducationEntry[] = [
  {
    title: "",
    subtitle: "",
    institution: "",
    year: "",
    description: "",
    highlights: [""],
  },
];

const defaultExperience: ExperienceEntry[] = [
  {
    title: "",
    company: "",
    period: "",
    description: "",
    technologies: [""],
    achievements: [""],
  },
];

type Tab = "profile" | "about" | "techstack" | "education" | "experience";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile Image", icon: <Camera size={18} /> },
  { id: "about", label: "About Me", icon: <User size={18} /> },
  { id: "techstack", label: "Tech Stack", icon: <Layers size={18} /> },
  { id: "education", label: "Education", icon: <GraduationCap size={18} /> },
  { id: "experience", label: "Experience", icon: <Briefcase size={18} /> },
];

export default function ContentPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profileImage, setProfileImage] = useState<string>("");
  const [about, setAbout] = useState<AboutContent>(defaultAbout);
  const [techStack, setTechStack] = useState<TechStackContent>(defaultTechStack);
  const [education, setEducation] = useState<EducationEntry[]>(defaultEducation);
  const [experience, setExperience] = useState<ExperienceEntry[]>(defaultExperience);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/sections");
      const data = await response.json();
      if (data.profileImage) setProfileImage(data.profileImage);
      if (data.aboutContent) setAbout(data.aboutContent);
      if (data.techStack) setTechStack(data.techStack);
      if (data.educationContent?.entries) setEducation(data.educationContent.entries);
      if (data.experienceContent?.entries) setExperience(data.experienceContent.entries);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImage: profileImage || "",
          aboutContent: about,
          techStack: techStack,
          educationContent: { entries: education },
          experienceContent: { entries: experience },
        }),
      });

      if (response.ok) {
        toast("Content saved successfully");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
      } else {
        toast("Failed to save content", "error");
      }
    } catch {
      toast("Failed to save content", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const addListItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, defaultValue: T) => {
    setter((prev) => [...prev, defaultValue]);
  };

  const removeListItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Content Management</h1>
          <p className="text-foreground/60 mt-1">Edit section content for your portfolio</p>
        </div>
        <Button onClick={handleSave} variant="primary" disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Saving...
            </span>
          ) : showSaveSuccess ? (
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={20} />
              Saved!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={20} />
              Save All
            </span>
          )}
        </Button>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.05)]"
                : "text-foreground/60 hover:bg-white/[0.03] hover:text-foreground/80 border border-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile" && (
            <GlassPanel className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Image</h2>
              <p className="text-foreground/60 text-sm">
                Upload your profile photo that appears in the Hero section.
              </p>

              {profileImage && (
                <div className="flex justify-center">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-primary/20 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    toast("Uploading...", "info");
                    const reader = new FileReader();
                    reader.onload = () => {
                      setProfileImage(reader.result as string);
                      toast("Profile image updated");
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="block w-full text-sm text-foreground/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/15 file:text-primary hover:file:bg-primary/25 file:transition-colors cursor-pointer"
                />
              </div>
            </GlassPanel>
          )}

          {activeTab === "about" && (
            <GlassPanel className="space-y-6">
              <h2 className="text-xl font-semibold">About Me Content</h2>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Bio Paragraphs</label>
                {about.bio.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={paragraph}
                      onChange={(e) => {
                        const newBio = [...about.bio];
                        newBio[index] = e.target.value;
                        setAbout({ ...about, bio: newBio });
                      }}
                      placeholder={`Bio paragraph ${index + 1}`}
                      rows={3}
                    />
                    {about.bio.length > 1 && (
                      <button
                        onClick={() => {
                          setAbout({ ...about, bio: about.bio.filter((_, i) => i !== index) });
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 self-start mt-1 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAbout({ ...about, bio: [...about.bio, ""] })}
                  className="flex items-center gap-2 mt-2"
                >
                  <Plus size={16} />
                  Add Paragraph
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Career Goals</label>
                {about.careerGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={goal}
                      onChange={(e) => {
                        const newGoals = [...about.careerGoals];
                        newGoals[index] = e.target.value;
                        setAbout({ ...about, careerGoals: newGoals });
                      }}
                      placeholder={`Career goal ${index + 1}`}
                    />
                    {about.careerGoals.length > 1 && (
                      <button
                        onClick={() => {
                          setAbout({ ...about, careerGoals: about.careerGoals.filter((_, i) => i !== index) });
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAbout({ ...about, careerGoals: [...about.careerGoals, ""] })}
                  className="flex items-center gap-2 mt-2"
                >
                  <Plus size={16} />
                  Add Goal
                </Button>
              </div>
            </GlassPanel>
          )}

          {activeTab === "techstack" && (
            <GlassPanel className="space-y-6">
              <h2 className="text-xl font-semibold">Tech Stack Tags</h2>
              <p className="text-foreground/60 text-sm">
                These tags appear in the Tech Stack section of your portfolio.
              </p>

              <div className="flex flex-wrap gap-2">
                {techStack.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...techStack.tags];
                        newTags[index] = e.target.value;
                        setTechStack({ ...techStack, tags: newTags });
                      }}
                      placeholder="Tech name"
                      className="w-40"
                    />
                    {techStack.tags.length > 1 && (
                      <button
                        onClick={() => {
                          setTechStack({ ...techStack, tags: techStack.tags.filter((_, i) => i !== index) });
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTechStack({ ...techStack, tags: [...techStack.tags, ""] })}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Tag
              </Button>
            </GlassPanel>
          )}

          {activeTab === "education" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-foreground/60 text-sm">
                  Manage your education entries. Skills & Expertise are managed separately.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    addListItem(setEducation, {
                      title: "",
                      subtitle: "",
                      institution: "",
                      year: "",
                      description: "",
                      highlights: [""],
                    })
                  }
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Education
                </Button>
              </div>

              <AnimatePresence>
                {education.map((edu, eduIndex) => (
                  <motion.div
                    key={eduIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  >
                    <GlassPanel className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground/80">
                          Education {eduIndex + 1}
                        </h3>
                        {education.length > 1 && (
                          <button
                            onClick={() => removeListItem(setEducation, eduIndex)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Title"
                          value={edu.title}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[eduIndex] = { ...updated[eduIndex], title: e.target.value };
                            setEducation(updated);
                          }}
                          placeholder="Bachelor of Computer Applications"
                        />
                        <Input
                          label="Subtitle"
                          value={edu.subtitle}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[eduIndex] = { ...updated[eduIndex], subtitle: e.target.value };
                            setEducation(updated);
                          }}
                          placeholder="Computer Science & IT"
                        />
                        <Input
                          label="Institution"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[eduIndex] = { ...updated[eduIndex], institution: e.target.value };
                            setEducation(updated);
                          }}
                          placeholder="University Name"
                        />
                        <Input
                          label="Year"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[eduIndex] = { ...updated[eduIndex], year: e.target.value };
                            setEducation(updated);
                          }}
                          placeholder="2022 - 2025"
                        />
                      </div>

                      <Textarea
                        label="Description"
                        value={edu.description}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[eduIndex] = { ...updated[eduIndex], description: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="Describe your education..."
                        rows={3}
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground/80">Highlights</label>
                        {edu.highlights.map((highlight, hIndex) => (
                          <div key={hIndex} className="flex gap-2 mb-2">
                            <Input
                              value={highlight}
                              onChange={(e) => {
                                const updated = [...education];
                                const newHighlights = [...updated[eduIndex].highlights];
                                newHighlights[hIndex] = e.target.value;
                                updated[eduIndex] = { ...updated[eduIndex], highlights: newHighlights };
                                setEducation(updated);
                              }}
                              placeholder={`Highlight ${hIndex + 1}`}
                            />
                            {edu.highlights.length > 1 && (
                              <button
                                onClick={() => {
                                  const updated = [...education];
                                  const newHighlights = updated[eduIndex].highlights.filter((_, i) => i !== hIndex);
                                  updated[eduIndex] = { ...updated[eduIndex], highlights: newHighlights };
                                  setEducation(updated);
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...education];
                            updated[eduIndex] = {
                              ...updated[eduIndex],
                              highlights: [...updated[eduIndex].highlights, ""],
                            };
                            setEducation(updated);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Highlight
                        </Button>
                      </div>
                    </GlassPanel>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-foreground/60 text-sm">
                  Manage your work experience entries.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    addListItem(setExperience, {
                      title: "",
                      company: "",
                      period: "",
                      description: "",
                      technologies: [""],
                      achievements: [""],
                    })
                  }
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Experience
                </Button>
              </div>

              <AnimatePresence>
                {experience.map((exp, expIndex) => (
                  <motion.div
                    key={expIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  >
                    <GlassPanel className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground/80">
                          Experience {expIndex + 1}
                        </h3>
                        {experience.length > 1 && (
                          <button
                            onClick={() => removeListItem(setExperience, expIndex)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Title"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[expIndex] = { ...updated[expIndex], title: e.target.value };
                            setExperience(updated);
                          }}
                          placeholder="Full Stack Developer"
                        />
                        <Input
                          label="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[expIndex] = { ...updated[expIndex], company: e.target.value };
                            setExperience(updated);
                          }}
                          placeholder="Company Name"
                        />
                      </div>

                      <Input
                        label="Period"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[expIndex] = { ...updated[expIndex], period: e.target.value };
                          setExperience(updated);
                        }}
                        placeholder="2024 - Present"
                      />

                      <Textarea
                        label="Description"
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[expIndex] = { ...updated[expIndex], description: e.target.value };
                          setExperience(updated);
                        }}
                        placeholder="Describe your role and responsibilities..."
                        rows={3}
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground/80">Technologies</label>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, tIndex) => (
                            <div key={tIndex} className="flex items-center gap-1">
                              <Input
                                value={tech}
                                onChange={(e) => {
                                  const updated = [...experience];
                                  const newTech = [...updated[expIndex].technologies];
                                  newTech[tIndex] = e.target.value;
                                  updated[expIndex] = { ...updated[expIndex], technologies: newTech };
                                  setExperience(updated);
                                }}
                                placeholder="Tech"
                                className="w-32"
                              />
                              {exp.technologies.length > 1 && (
                                <button
                                  onClick={() => {
                                    const updated = [...experience];
                                    const newTech = updated[expIndex].technologies.filter((_, i) => i !== tIndex);
                                    updated[expIndex] = { ...updated[expIndex], technologies: newTech };
                                    setExperience(updated);
                                  }}
                                  className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...experience];
                            updated[expIndex] = {
                              ...updated[expIndex],
                              technologies: [...updated[expIndex].technologies, ""],
                            };
                            setExperience(updated);
                          }}
                          className="flex items-center gap-2 mt-2"
                        >
                          <Plus size={16} />
                          Add Tech
                        </Button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground/80">Achievements</label>
                        {exp.achievements.map((achievement, aIndex) => (
                          <div key={aIndex} className="flex gap-2 mb-2">
                            <Input
                              value={achievement}
                              onChange={(e) => {
                                const updated = [...experience];
                                const newAchievements = [...updated[expIndex].achievements];
                                newAchievements[aIndex] = e.target.value;
                                updated[expIndex] = { ...updated[expIndex], achievements: newAchievements };
                                setExperience(updated);
                              }}
                              placeholder={`Achievement ${aIndex + 1}`}
                            />
                            {exp.achievements.length > 1 && (
                              <button
                                onClick={() => {
                                  const updated = [...experience];
                                  const newAchievements = updated[expIndex].achievements.filter((_, i) => i !== aIndex);
                                  updated[expIndex] = { ...updated[expIndex], achievements: newAchievements };
                                  setExperience(updated);
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...experience];
                            updated[expIndex] = {
                              ...updated[expIndex],
                              achievements: [...updated[expIndex].achievements, ""],
                            };
                            setExperience(updated);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Achievement
                        </Button>
                      </div>
                    </GlassPanel>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
