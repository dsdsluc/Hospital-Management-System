"use client";

import { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  collapsed: boolean;
  children: ReactNode;
}

export function SidebarSection({ title, collapsed, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </div>
      )}
      {collapsed && (
        <div className="mb-2 h-px w-full bg-slate-100 mx-auto" />
      )}
      <div className="space-y-0.5 px-2">
        {children}
      </div>
    </div>
  );
}
