import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}

export function EmptyState({ title, description, action, icon: Icon = FolderOpen }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
      <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      {action}
    </div>
  );
}
