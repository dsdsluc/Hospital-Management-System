"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar/AdminSidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar (Desktop: Fixed, Mobile: Drawer) */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        isCollapsed={isCollapsed}
        setSidebarOpen={setSidebarOpen}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Wrapper */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? "md:pl-20" : "md:pl-72"
        }`}
      >
        {/* Top Navigation */}
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
