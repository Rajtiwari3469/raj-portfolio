"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, KeyRound } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
        setForgotMessage("Password reset successfully! You can now login.");
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <GlassPanel>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-foreground/60 mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={18} />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-primary/80 hover:text-primary flex items-center gap-1.5 mx-auto"
              >
                <KeyRound size={14} />
                Forgot Password?
              </button>
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
                    placeholder="Enter your admin email"
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
