import React from "react";
import { FilterDropdown } from "@/components/patient/shared/FilterDropdown";

interface AppointmentFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
}

export function AppointmentFilters({
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <FilterDropdown
        label="Status"
        options={[
          { label: "Requested", value: "REQUESTED" },
          { label: "Confirmed", value: "CONFIRMED" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Cancelled", value: "CANCELLED" },
        ]}
        value={statusFilter}
        onChange={onStatusChange}
      />
      
      {/* Date filter could be a date picker, simpler for now */}
      <FilterDropdown
        label="Date Range"
        options={[
          { label: "Upcoming", value: "upcoming" },
          { label: "Past 30 Days", value: "past_30" },
          { label: "Past 6 Months", value: "past_6m" },
          { label: "All Time", value: "all" },
        ]}
        value={dateFilter}
        onChange={onDateChange}
      />
    </div>
  );
}
