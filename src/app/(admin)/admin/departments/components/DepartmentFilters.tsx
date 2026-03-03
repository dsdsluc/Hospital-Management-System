import { Search } from "lucide-react";
import Input from "@/components/ui/Input";

export function DepartmentFilters({
  search,
  onChange,
  onAdd,
}: {
  search: string;
  onChange: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <button
        onClick={onAdd}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Add Department
      </button>
    </div>
  );
}
