import React from "react";
import { ChevronDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  keyExtractor,
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 font-semibold text-gray-500 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`group transition-colors hover:bg-gray-50/50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
}
