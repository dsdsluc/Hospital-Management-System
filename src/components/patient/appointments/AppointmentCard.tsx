import React from "react";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { StatusBadge } from "@/components/patient/shared/StatusBadge";
import { Card } from "@/components/patient/shared/Card";
import Button from "@/components/ui/Button";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: string;
  imageUrl?: string;
  canCancel: boolean;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function AppointmentCard({ appointment, onCancel, onViewDetails }: AppointmentCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5 transition-all hover:border-blue-100 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
            <img
              src={appointment.imageUrl || `https://ui-avatars.com/api/?name=${appointment.doctorName}`}
              alt={appointment.doctorName}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{appointment.doctorName}</h4>
            <p className="text-sm text-gray-500">{appointment.specialty}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} type={getStatusType(appointment.status)} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>{appointment.time}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span>{appointment.location}</span>
        </div>
      </div>

      <div className="mt-2 flex gap-3 border-t border-gray-50 pt-4">
        <Button 
          variant="outline" 
          className="w-full text-xs" 
          onClick={() => onViewDetails(appointment.id)}
        >
          View Details
        </Button>
        {appointment.canCancel && (
          <Button 
            variant="ghost" 
            className="w-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onCancel(appointment.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}

function getStatusType(status: string) {
  const s = status.toLowerCase();
  if (s === "requested" || s === "booked" || s === "rescheduled") return "warning";
  if (s === "confirmed") return "info";
  if (s === "checked_in" || s === "in_progress") return "info"; // Or a new 'active' type
  if (s === "completed") return "success";
  if (s === "cancelled" || s === "no_show") return "error";
  return "neutral";
}
