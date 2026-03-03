import { Card } from "@/components/ui/Card";

export function SummaryCards({
  total,
  upcoming,
  completed,
}: {
  total: number;
  upcoming: number;
  completed: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Appointments" value={total} />
      <Card title="Upcoming" value={upcoming} />
      <Card title="Completed" value={completed} />
    </div>
  );
}
