"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Building2,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import { logout } from "@/lib/auth/logout";

interface AdminSidebarProps {
  sidebarOpen: boolean; // Mobile state
  isCollapsed: boolean; // Desktop state
  setSidebarOpen: (open: boolean) => void;
  toggleCollapse: () => void;
}

export default function AdminSidebar({
  sidebarOpen,
  isCollapsed,
  setSidebarOpen,
  toggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 shadow-xl md:shadow-none transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            className={`flex h-16 items-center border-b border-slate-100 ${isCollapsed ? "justify-center px-0" : "px-6"}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30">
                <Activity size={20} strokeWidth={2.5} />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col fade-in">
                  <span className="font-bold text-lg leading-tight text-slate-800 tracking-tight">
                    MedCore
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Admin Panel
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-200">
            <SidebarSection title="Main" collapsed={isCollapsed}>
              <SidebarItem
                icon={LayoutDashboard}
                label="Dashboard"
                href="/admin"
                active={pathname === "/admin"}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
            </SidebarSection>

            <SidebarSection title="Management" collapsed={isCollapsed}>
              <SidebarItem
                icon={Users}
                label="Doctors"
                href="/admin/doctors"
                active={isActive("/admin/doctors")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
              <SidebarItem
                icon={UserCircle}
                label="Patients"
                href="/admin/patients"
                active={isActive("/admin/patients")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
              <SidebarItem
                icon={Building2}
                label="Departments"
                href="/admin/departments"
                active={isActive("/admin/departments")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
              <SidebarItem
                icon={CalendarDays}
                label="Appointments"
                href="/admin/appointments"
                active={isActive("/admin/appointments")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
            </SidebarSection>

            <SidebarSection title="Analytics" collapsed={isCollapsed}>
              <SidebarItem
                icon={FileText}
                label="Reports"
                href="/admin/reports"
                active={isActive("/admin/reports")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
            </SidebarSection>

            <SidebarSection title="System" collapsed={isCollapsed}>
              <SidebarItem
                icon={Settings}
                label="Settings"
                href="/admin/settings"
                active={isActive("/admin/settings")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
              <SidebarItem
                icon={ShieldCheck}
                label="Access Control"
                href="/admin/access"
                active={isActive("/admin/access")}
                collapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)}
              />
            </SidebarSection>
          </div>

          {/* Footer / User Profile */}
          <div className="border-t border-slate-100 p-4">
            {/* Collapse Toggle (Desktop Only) */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center justify-center p-2 mb-4 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider w-full px-2">
                  <ChevronLeft size={16} />
                  <span>Collapse Sidebar</span>
                </div>
              )}
            </button>

            <div
              className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 transition-all ${isCollapsed ? "justify-center p-2" : ""}`}
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                <UserCircle size={20} />
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    Admin User
                  </p>
                  <p className="truncate text-xs text-slate-500">Super Admin</p>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
