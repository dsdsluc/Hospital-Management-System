import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/patient/shared/Card";
import { StatusBadge } from "@/components/patient/shared/StatusBadge";
import Button from "@/components/ui/Button";

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  doctorName: string;
  department: string;
  status: "final" | "preliminary";
  description?: string;
  details?: {
    diagnosis: string;
    allergies?: string;
    vitals?: any;
    filesRef?: string;
  };
}

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

export function MedicalRecordCard({
  record,
  onView,
  onDownload,
}: MedicalRecordCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Format vitals for display
  const formatVitals = (vitals: any) => {
    if (!vitals || typeof vitals !== "object") return null;
    return Object.entries(vitals).map(([key, value]) => (
      <div
        key={key}
        className="flex flex-col bg-white p-2 rounded border border-gray-100 shadow-sm"
      >
        <span className="text-xs text-gray-500 uppercase font-semibold">
          {key.replace(/([A-Z])/g, " $1").trim()}
        </span>
        <span className="text-sm font-medium text-gray-800">
          {String(value)}
        </span>
      </div>
    ));
  };

  return (
    <Card
      className={`flex flex-col gap-4 p-5 transition-all hover:border-blue-100 hover:shadow-md ${expanded ? "border-blue-200 ring-1 ring-blue-100" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex shrink-0">
            <FileText size={24} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {record.title}
              </h4>
              <StatusBadge
                status={record.status}
                type={record.status === "final" ? "success" : "warning"}
              />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-2">
              {record.type} • {record.department}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                <span>
                  {new Date(record.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={15} className="text-gray-400" />
                <span>Dr. {record.doctorName}</span>
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
              onClick={() => onView(record.id)}
            >
              <Eye size={16} />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-2"
              onClick={() => onDownload(record.id)}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline self-end"
          >
            {expanded ? "Show Less" : "Show Details"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-4 border-t border-gray-100 grid gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {record.details?.vitals && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <Activity size={16} className="text-rose-500" />
                <span>Vitals</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg">
                {formatVitals(record.details.vitals)}
              </div>
            </div>
          )}

          {record.details?.allergies && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <AlertCircle size={16} className="text-amber-500" />
                <span>Allergies</span>
              </div>
              <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                {record.details.allergies}
              </p>
            </div>
          )}

          {record.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Notes</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {record.description}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
