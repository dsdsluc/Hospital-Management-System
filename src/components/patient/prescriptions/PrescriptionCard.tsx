import React, { useState } from "react";
import {
  Calendar,
  Pill,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
} from "lucide-react";
import { Card } from "@/components/patient/shared/Card";
import { StatusBadge } from "@/components/patient/shared/StatusBadge";
import Button from "@/components/ui/Button";

interface PrescriptionCardProps {
  prescription: {
    id: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    instructions: string;
    createdAt: string;
    status: "active" | "expired";
    doctor: {
      name: string;
      specialization: string;
    };
  };
  onRefill?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function PrescriptionCard({
  prescription,
  onRefill,
  onDownload,
}: PrescriptionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = prescription.status === "active";

  return (
    <Card
      className={`flex flex-col gap-4 p-5 transition-all hover:border-blue-100 hover:shadow-md ${expanded ? "border-blue-200 ring-1 ring-blue-100" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 sm:flex shrink-0">
            <Pill size={24} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {prescription.medications.length > 0
                  ? prescription.medications[0].name
                  : "Prescription"}
                {prescription.medications.length > 1 && (
                  <span className="text-gray-500 font-normal text-base ml-1">
                    +{prescription.medications.length - 1} more
                  </span>
                )}
              </h4>
              <StatusBadge
                status={prescription.status}
                type={isActive ? "success" : "neutral"}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                <span>
                  {new Date(prescription.createdAt).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={15} className="text-gray-400" />
                <span>Dr. {prescription.doctor.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs">
                  {prescription.doctor.specialization}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 mt-2 sm:mt-0">
          <div className="flex gap-2 w-full sm:w-auto">
            {isActive && onRefill && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1 sm:flex-none gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => onRefill(prescription.id)}
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refill</span>
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none gap-2"
                onClick={() => onDownload(prescription.id)}
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
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
        <div className="mt-2 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <h5 className="text-sm font-medium text-gray-900 mb-3">
            Medication Details
          </h5>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            {prescription.medications.map((med, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-1"
              >
                <div className="font-semibold text-gray-900">{med.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">
                    {med.dosage}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{med.frequency}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Duration: {med.duration}
                </div>
              </div>
            ))}
          </div>

          {prescription.instructions && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Instructions
              </h5>
              <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3 leading-relaxed">
                {prescription.instructions}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
