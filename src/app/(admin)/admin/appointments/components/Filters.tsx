import { Calendar, Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import type { AppointmentFilters } from "@/types/appointments";
import type { DepartmentListItem } from "@/types/departments";
import type { DoctorListItem } from "@/lib/services/admin/doctors.client";

export function Filters({
  filters,
  setFilters,
  departments,
  doctors,
}: {
  filters: AppointmentFilters;
  setFilters: (f: AppointmentFilters) => void;
  departments: DepartmentListItem[];
  doctors: DoctorListItem[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value, page: 1 })
          }
          className="pl-10"
        />
      </div>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value, page: 1 })
          }
          className="pl-10"
        />
      </div>
      <Select
        value={filters.departmentId}
        onChange={(v) => setFilters({ ...filters, departmentId: v, page: 1 })}
        placeholder="All Departments"
        options={departments.map((d) => ({ value: d.id, label: d.name }))}
      />
      <Select
        value={filters.status}
        onChange={(v) =>
          setFilters({
            ...filters,
            status: v as AppointmentFilters["status"],
            page: 1,
          })
        }
        placeholder="All Status"
        options={[
          { value: "", label: "All Status" },
          { value: "BOOKED", label: "Booked" },
          { value: "COMPLETED", label: "Completed" },
          { value: "CANCELLED", label: "Cancelled" },
          { value: "RESCHEDULED", label: "Rescheduled" },
        ]}
      />
      <Select
        value={filters.doctorId}
        onChange={(v) => setFilters({ ...filters, doctorId: v, page: 1 })}
        placeholder="All Doctors"
        options={doctors.map((d) => ({ value: d.id, label: `Dr. ${d.name}` }))}
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search patients..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
          className="pl-10"
        />
      </div>
    </div>
  );
}
