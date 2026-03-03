"use client";

import { useState } from "react";
import { Bell, Search, Menu, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Determine current page title from pathname
  const getPageTitle = (path: string) => {
    if (path === "/admin") return "Dashboard";
    const segment = path.split("/").pop();
    if (!segment) return "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md transition-all lg:px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="mr-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Breadcrumb / Title */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-800">
            {getPageTitle(pathname)}
          </h1>
          <div className="flex items-center text-xs text-gray-500">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-gray-700">{getPageTitle(pathname)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden md:block relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </span>
        </button>

        {/* Profile Dropdown (Simplified) */}
        <div className="relative flex items-center gap-3 cursor-pointer group">
          <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-blue-50 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-medium text-gray-700 group-hover:text-blue-600">Administrator</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
        </div>
      </div>
    </header>
  );
}
