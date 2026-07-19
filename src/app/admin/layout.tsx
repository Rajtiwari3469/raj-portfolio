"use client";

import AdminSidebar from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-[#050510]">
        <AdminSidebar />
        <main className="flex-1 lg:ml-[280px] transition-all duration-300 p-6 lg:p-8 relative overflow-y-auto">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/[0.02] rounded-full blur-[120px]" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </ToastProvider>
  );
}
