"use client";

import { useState, useEffect } from "react";
import PatientSidebar from "@/components/patient/PatientSidebar";
import PatientHeader from "@/components/patient/PatientHeader";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; 
  }

  return (
    <div className="flex h-screen w-full bg-gray-50/50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <PatientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden md:pl-72 transition-all duration-300">
        {/* Header */}
        <PatientHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
