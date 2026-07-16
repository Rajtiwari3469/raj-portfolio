"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Code2,
  FileText,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  MessageCircle,
  Mail,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Skills", href: "/admin/skills", icon: Code2 },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Resume", href: "/admin/resume", icon: FileText },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Touch Messages", href: "/admin/touch-messages", icon: Mail },
  { name: "Chat", href: "/admin/chat", icon: MessageCircle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl glass border border-white/[0.08] hover:bg-white/[0.03] transition-colors"
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-[#050510]/80 backdrop-blur-md"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 80,
        }}
        className={`fixed left-0 top-0 h-full glass z-50 flex flex-col transition-all duration-300 border-r border-white/[0.05] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/[0.05]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.08)]">
              <span className="text-primary font-bold text-sm">RT</span>
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold tracking-wide"
              >
                Admin Panel
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.05)]"
                    : "text-foreground/40 hover:bg-white/[0.03] hover:text-foreground/70 border border-transparent"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(0,212,255,0.3)]" />
                )}
                <item.icon size={20} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium tracking-wide text-sm"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.05]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/40 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200 w-full"
          >
            <LogOut size={20} />
            {isOpen && <span className="font-medium text-sm tracking-wide">Logout</span>}
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.08] items-center justify-center hover:bg-primary/10 hover:border-primary/20 transition-all"
        >
          <ChevronLeft
            size={14}
            className={`transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
          />
        </button>
      </motion.aside>
    </>
  );
}
