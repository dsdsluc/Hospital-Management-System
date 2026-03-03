import React from "react";
import { LucideIcon } from "lucide-react";

export type BadgeVariant =
  | "gray"
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "indigo"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  dotClassName?: string;
  icon?: LucideIcon;
}

export function Badge({
  children,
  variant = "gray",
  className = "",
  dot = false,
  dotClassName = "",
  icon: Icon,
}: BadgeProps) {
  const styles: Record<BadgeVariant, { base: string; dot: string }> = {
    gray: { base: "bg-gray-100 text-gray-800", dot: "bg-gray-400" },
    blue: { base: "bg-blue-100 text-blue-800", dot: "bg-blue-400" },
    green: { base: "bg-green-100 text-green-800", dot: "bg-green-400" },
    red: { base: "bg-red-100 text-red-800", dot: "bg-red-400" },
    yellow: { base: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
    purple: { base: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
    orange: { base: "bg-orange-100 text-orange-800", dot: "bg-orange-400" },
    indigo: { base: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-400" },

    // Patient style variants (often lighter bg with border)
    neutral: {
      base: "bg-gray-50 text-gray-600 border border-gray-200",
      dot: "bg-gray-400",
    },
    success: {
      base: "bg-green-50 text-green-700 border border-green-200",
      dot: "bg-green-400",
    },
    warning: {
      base: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      dot: "bg-yellow-400",
    },
    error: {
      base: "bg-red-50 text-red-700 border border-red-200",
      dot: "bg-red-400",
    },
    info: {
      base: "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-400",
    },
    pending: {
      base: "bg-orange-50 text-orange-700 border border-orange-200",
      dot: "bg-orange-400",
    },
  };

  const style = styles[variant] || styles.gray;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.base} ${className}`}
    >
      {dot && (
        <span
          className={`w-2 h-2 mr-1.5 rounded-full ${style.dot} ${dotClassName}`}
        />
      )}
      {Icon && <Icon size={12} strokeWidth={2.5} className="mr-1.5" />}
      {children}
    </span>
  );
}
