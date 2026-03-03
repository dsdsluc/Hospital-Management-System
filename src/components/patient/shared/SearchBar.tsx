import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = "Search...", onSearch, className = "" }: SearchBarProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
      />
    </div>
  );
}
