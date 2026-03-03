import React, { useState } from "react";
import {
  Beaker,
  Eye,
  Download,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Card } from "@/components/patient/shared/Card";
import { StatusBadge } from "@/components/patient/shared/StatusBadge";
import Button from "@/components/ui/Button";

interface TestResult {
  id: string;
  testName: string;
  date: string;
  orderedBy: string;
  status: "normal" | "abnormal" | "pending";
  summary?: string;
}

interface TestResultCardProps {
  result: TestResult;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

export function TestResultCard({
  result,
  onView,
  onDownload,
}: TestResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusType = (status: string) => {
    switch (status) {
      case "normal":
        return "success";
      case "abnormal":
        return "error";
      case "pending":
        return "pending";
      default:
        return "neutral";
    }
  };

  const statusType = getStatusType(result.status);
  const isAbnormal = result.status === "abnormal";

  return (
    <Card
      className={`flex flex-col gap-4 p-5 transition-all hover:border-blue-100 hover:shadow-md ${expanded ? "border-blue-200 ring-1 ring-blue-100" : ""} ${isAbnormal ? "border-l-4 border-l-red-400" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`hidden h-12 w-12 items-center justify-center rounded-xl sm:flex shrink-0 ${isAbnormal ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-600"}`}
          >
            <Beaker size={24} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {result.testName}
              </h4>
              <StatusBadge status={result.status} type={statusType} />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                <span>
                  Reported:{" "}
                  {new Date(result.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={15} className="text-gray-400" />
                <span>Dr. {result.orderedBy}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 mt-2 sm:mt-0">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-2"
              onClick={() => onView(result.id)}
            >
              <Eye size={16} />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-2"
              onClick={() => onDownload(result.id)}
            >
              <Download size={16} />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline self-end"
          >
            {expanded ? "Show Less" : "Show Summary"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && result.summary && (
        <div className="mt-2 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
            <FileText size={16} className="text-gray-500" />
            <span>Result Summary</span>
          </div>
          <p
            className={`text-sm leading-relaxed p-3 rounded-lg border ${isAbnormal ? "bg-red-50 border-red-100 text-red-800" : "bg-gray-50 border-gray-100 text-gray-700"}`}
          >
            {result.summary}
          </p>
        </div>
      )}
    </Card>
  );
}
