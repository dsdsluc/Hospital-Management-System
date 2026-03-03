"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-3 py-2.5 my-1 rounded-lg text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-4 border-transparent"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
      title={collapsed ? label : undefined}
    >
      <div
        className={`
          flex items-center justify-center transition-colors
          ${active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"}
        `}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      
      {!collapsed && (
        <span className="truncate transition-all duration-200">
          {label}
        </span>
      )}
      
      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-16 z-50 ml-2 w-max rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );
}
