"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Palette, Link as LinkIcon } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Settings {
  [key: string]: string;
}

const defaultSettings = {
  primaryColor: "#6366f1",
  accentColor: "#06b6d4",
  github: "",
  linkedin: "",
  instagram: "",
  youtube: "",
  leetcode: "",
  email: "",
  phone: "",
  location: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-foreground/60 mt-1">Customize your portfolio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassPanel>
              <div className="flex items-center gap-2 mb-6">
                <Palette className="text-primary" size={20} />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      placeholder="#06b6d4"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-foreground/60 mb-2">Preview</p>
                  <div className="flex gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      A
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settings.accentColor }}
                    >
                      B
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassPanel>
              <div className="flex items-center gap-2 mb-6">
                <LinkIcon className="text-accent" size={20} />
                <h2 className="text-xl font-semibold">Social Links</h2>
              </div>

              <div className="space-y-4">
                <Input
                  label="GitHub URL"
                  value={settings.github}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="LinkedIn URL"
                  value={settings.linkedin}
                  onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="Instagram URL"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
                <Input
                  label="YouTube URL"
                  value={settings.youtube}
                  onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
                <Input
                  label="LeetCode URL"
                  value={settings.leetcode}
                  onChange={(e) => setSettings({ ...settings, leetcode: e.target.value })}
                  placeholder="https://leetcode.com/..."
                />
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <GlassPanel>
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="your@email.com"
                />
                <Input
                  label="Phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
                <Input
                  label="Location"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  placeholder="India"
                />
              </div>
            </GlassPanel>
          </motion.div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={20} />
                Save Settings
              </span>
            )}
          </Button>

          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm ${
                saveStatus === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {saveStatus === "success" ? "Settings saved successfully!" : "Failed to save settings"}
            </motion.div>
          )}
        </div>
      </form>
    </div>
  );
}
