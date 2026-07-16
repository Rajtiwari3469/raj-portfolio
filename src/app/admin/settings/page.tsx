"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Palette, Link as LinkIcon, Shield, Eye, EyeOff, KeyRound } from "lucide-react";
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
  x: "",
  leetcode: "",
  email: "",
  location: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  const [oldUsername, setOldUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingCredentials, setIsChangingCredentials] = useState(false);
  const [credentialStatus, setCredentialStatus] = useState<"success" | "error" | null>(null);
  const [credentialMessage, setCredentialMessage] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<"success" | "error" | null>(null);
  const [forgotMessage, setForgotMessage] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

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

  const handleCredentialChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingCredentials(true);
    setCredentialStatus(null);
    setCredentialMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setCredentialStatus("error");
      setCredentialMessage("New passwords do not match");
      setIsChangingCredentials(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldUsername,
          oldPassword,
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCredentialStatus("success");
        setCredentialMessage("Credentials updated successfully!");
        setOldUsername("");
        setOldPassword("");
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setCredentialStatus(null);
          setCredentialMessage("");
        }, 3000);
      } else {
        setCredentialStatus("error");
        setCredentialMessage(data.error || "Failed to change credentials");
      }
    } catch {
      setCredentialStatus("error");
      setCredentialMessage("An error occurred. Please try again.");
    } finally {
      setIsChangingCredentials(false);
    }
  };

  const handleSendResetCode = async () => {
    setIsSendingReset(true);
    setForgotStatus(null);
    setForgotMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotStatus("success");
        setForgotMessage(data.message || "Reset code sent to your email");
        if (data.code) {
          setForgotMessage(`Email sending not configured. Your reset code is: ${data.code}`);
        }
        setShowResetForm(true);
      } else {
        setForgotStatus("error");
        setForgotMessage(data.error || "Failed to send reset code");
      }
    } catch {
      setForgotStatus("error");
      setForgotMessage("An error occurred. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    setForgotStatus(null);
    setForgotMessage("");

    if (resetNewPassword !== resetConfirmPassword) {
      setForgotStatus("error");
      setForgotMessage("Passwords do not match");
      setIsResettingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: resetCode,
          newPassword: resetNewPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotStatus("success");
        setForgotMessage("Password reset successfully! You can now login with your new password.");
        setTimeout(() => {
          setShowForgotModal(false);
          setShowResetForm(false);
          setForgotEmail("");
          setResetCode("");
          setResetNewPassword("");
          setResetConfirmPassword("");
          setForgotStatus(null);
          setForgotMessage("");
        }, 2000);
      } else {
        setForgotStatus("error");
        setForgotMessage(data.error || "Failed to reset password");
      }
    } catch {
      setForgotStatus("error");
      setForgotMessage("An error occurred. Please try again.");
    } finally {
      setIsResettingPassword(false);
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
                  label="X (Twitter) URL"
                  value={settings.x}
                  onChange={(e) => setSettings({ ...settings, x: e.target.value })}
                  placeholder="https://x.com/..."
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassPanel>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              <h2 className="text-xl font-semibold">Security - Change Credentials</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForgotModal(true)}
              className="flex items-center gap-2 text-sm"
            >
              <KeyRound size={16} />
              Forgot Password?
            </Button>
          </div>

          <form onSubmit={handleCredentialChange} className="space-y-4">
            <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/10">
              <p className="text-sm text-foreground/60 mb-4">Enter your current credentials to make changes</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Old Username"
                    value={oldUsername}
                    onChange={(e) => setOldUsername(e.target.value)}
                    placeholder="Enter current username"
                    required
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Old Password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-9 text-foreground/40 hover:text-foreground"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground/60 mb-4">Enter new credentials (leave blank to keep current)</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="New Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username (optional)"
                />
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-9 text-foreground/40 hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPassword && (
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" variant="primary" disabled={isChangingCredentials}>
                {isChangingCredentials ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield size={20} />
                    Update Credentials
                  </span>
                )}
              </Button>

              {credentialStatus && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm ${
                    credentialStatus === "success" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {credentialMessage}
                </motion.div>
              )}
            </div>
          </form>
        </GlassPanel>
      </motion.div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4"
          >
            <GlassPanel className="relative">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setShowResetForm(false);
                  setForgotEmail("");
                  setResetCode("");
                  setResetNewPassword("");
                  setResetConfirmPassword("");
                  setForgotStatus(null);
                  setForgotMessage("");
                }}
                className="absolute top-4 right-4 text-foreground/40 hover:text-foreground"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <KeyRound className="mx-auto mb-4 text-primary" size={32} />
                <h2 className="text-2xl font-bold">Forgot Password</h2>
                <p className="text-foreground/60 mt-2">
                  {showResetForm
                    ? "Enter the reset code and your new password"
                    : "Enter your admin email to receive a reset code"}
                </p>
              </div>

              {!showResetForm ? (
                <div className="space-y-4">
                  <Input
                    label="Admin Email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tiwariraj3469@gmail.com"
                  />

                  {forgotStatus && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3 rounded-xl text-sm ${
                        forgotStatus === "success"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {forgotMessage}
                    </motion.div>
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    onClick={handleSendResetCode}
                    disabled={isSendingReset || !forgotEmail}
                  >
                    {isSendingReset ? "Sending..." : "Send Reset Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Reset Code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />

                  {forgotStatus && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3 rounded-xl text-sm ${
                        forgotStatus === "success"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {forgotMessage}
                    </motion.div>
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || !resetCode || !resetNewPassword || !resetConfirmPassword}
                  >
                    {isResettingPassword ? "Resetting..." : "Reset Password"}
                  </Button>

                  <button
                    onClick={() => setShowResetForm(false)}
                    className="w-full text-sm text-foreground/60 hover:text-foreground"
                  >
                    ← Back to send code
                  </button>
                </div>
              )}
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </div>
  );
}
