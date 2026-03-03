import React from "react";
import {
  Check,
  X,
  Clock,
  AlertCircle,
  Info,
  Minus,
  LucideIcon,
} from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "pending";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  icon?: LucideIcon;
}

export function StatusBadge({
  status,
  type = "neutral",
  icon,
}: StatusBadgeProps) {
  const defaultIcons: Record<StatusType, LucideIcon> = {
    success: Check,
    warning: AlertCircle,
    error: X,
    info: Info,
    neutral: Minus,
    pending: Clock,
  };

  const IconComponent = icon || defaultIcons[type];

  // Map StatusType to BadgeVariant
  // Since we added matching variants to Badge, it's a direct mapping except capitalization/naming if needed
  const variant = type as BadgeVariant;

  return (
    <Badge
      variant={variant}
      icon={IconComponent}
      className="uppercase tracking-wide"
    >
      {status}
    </Badge>
  );
}
