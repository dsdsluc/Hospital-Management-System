import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all ${
          value
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Filter size={16} />
        <span>{value ? selectedLabel : label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                !value ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                  value === option.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
