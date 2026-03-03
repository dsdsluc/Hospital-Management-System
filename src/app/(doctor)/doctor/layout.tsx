"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/doctor/Sidebar';
import Topbar from '@/components/doctor/Topbar';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Shared Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
           {children}
        </div>
      </div>
    </div>
  );
}
