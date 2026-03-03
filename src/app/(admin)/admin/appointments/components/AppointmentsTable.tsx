import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Appointment } from "@/types/appointments";

export function AppointmentsTable({
  data,
  onAction,
}: {
  data: Appointment[];
  onAction: (id: string, action: "COMPLETE" | "CANCEL" | "REBOOK") => void;
}) {
  return (
    <Table
      columns={[
        { key: "scheduledAt", header: "Date & Time" },
        { key: "patient", header: "Patient" },
        { key: "doctor", header: "Doctor" },
        { key: "department", header: "Department" },
        { key: "status", header: "Status" },
        { key: "notes", header: "Notes" },
        { key: "actions", header: "Actions" },
      ]}
      rows={data.map((a) => ({
        scheduledAt: new Date(a.scheduledAt).toLocaleString(),
        patient: `${a.patient.name}\n${a.patient.email}`,
        doctor: `Dr. ${a.doctor.name}\n${a.doctor.specialization}`,
        department: a.department.name,
        status: (
          <Badge
            variant={
              a.status === "BOOKED"
                ? "blue"
                : a.status === "COMPLETED"
                  ? "green"
                  : "red"
            }
          >
            {a.status}
          </Badge>
        ),
        notes: a.notes ?? "-",
        actions: (
          <div className="flex items-center gap-2">
            {a.status === "BOOKED" && (
              <>
                <button
                  className="text-green-600"
                  onClick={() => onAction(a.id, "COMPLETE")}
                >
                  Complete
                </button>
                <button
                  className="text-red-600"
                  onClick={() => onAction(a.id, "CANCEL")}
                >
                  Cancel
                </button>
              </>
            )}
            {a.status === "CANCELLED" && (
              <button
                className="text-blue-600"
                onClick={() => onAction(a.id, "REBOOK")}
              >
                Rebook
              </button>
            )}
          </div>
        ),
      }))}
    />
  );
}
