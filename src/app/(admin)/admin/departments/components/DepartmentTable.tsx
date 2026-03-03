import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { DepartmentListItem } from "@/types/departments";

export function DepartmentTable({
  data,
  onEdit,
  onAssign,
  onDelete,
  onView,
}: {
  data: DepartmentListItem[];
  onEdit: (item: DepartmentListItem) => void;
  onAssign: (item: DepartmentListItem) => void;
  onDelete: (item: DepartmentListItem) => void;
  onView?: (item: DepartmentListItem) => void;
}) {
  return (
    <Table
      columns={[
        { key: "name", header: "Name" },
        { key: "head", header: "Head Doctor" },
        { key: "members", header: "Members" },
        { key: "appointments", header: "Appointments" },
        { key: "actions", header: "Actions" },
      ]}
      rows={data.map((d) => ({
        name: (
          <button
            className="text-blue-700 hover:underline"
            onClick={() => onView?.(d)}
          >
            {d.name}
          </button>
        ),
        head: d.headDoctor ? (
          <div>
            <div className="font-medium">{d.headDoctor.name}</div>
            <div className="text-xs text-gray-500">
              {d.headDoctor.specialization}
            </div>
          </div>
        ) : (
          <Badge variant="gray">None</Badge>
        ),
        members: d.memberCount ?? 0,
        appointments: d.appointmentCount ?? 0,
        actions: (
          <div className="flex items-center gap-2">
            <button className="text-blue-600" onClick={() => onEdit(d)}>
              Edit
            </button>
            <button className="text-purple-600" onClick={() => onAssign(d)}>
              Assign Head
            </button>
            <button
              className="text-red-600"
              onClick={() => onDelete(d)}
              disabled={
                (d.memberCount ?? 0) > 0 || (d.appointmentCount ?? 0) > 0
              }
            >
              Delete
            </button>
          </div>
        ),
      }))}
    />
  );
}
