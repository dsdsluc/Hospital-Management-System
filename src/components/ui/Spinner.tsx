import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
    </div>
  );
}
