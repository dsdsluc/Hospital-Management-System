import React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  ACTIVE: "green",
  SUSPENDED: "red",
  DEACTIVATED: "gray",
  PENDING_APPROVAL: "yellow",
  BOOKED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  RESCHEDULED: "yellow",
  CONFIRMED: "purple",
  REQUESTED: "orange",
  CHECKED_IN: "indigo",
  IN_PROGRESS: "blue",
  NO_SHOW: "gray",
  SCHEDULED: "blue",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || "gray";

  // Special handling for IN_PROGRESS to match original styles
  const extraClasses =
    status === "IN_PROGRESS" ? "ring-2 ring-blue-500 ring-opacity-50" : "";

  const dotClasses =
    status === "IN_PROGRESS"
      ? "animate-pulse bg-blue-500" // Original had bg-blue-500, but Badge will apply bg-blue-400 by default. Let's override.
      : "";

  return (
    <Badge
      variant={variant}
      dot={true}
      className={`${extraClasses} ${className}`}
      dotClassName={dotClasses}
    >
      {status === "PENDING_APPROVAL" ? "PENDING" : status}
    </Badge>
  );
}
