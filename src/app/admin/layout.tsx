"use client";

import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-[280px] transition-all duration-300 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
