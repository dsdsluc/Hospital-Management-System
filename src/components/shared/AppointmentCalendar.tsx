"use client";

import React, { useState } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface AppointmentEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  status: string;
}

interface AppointmentCalendarProps {
  appointments: any[];
  onEventClick?: (event: AppointmentEvent) => void;
  role: "admin" | "doctor";
}

export function AppointmentCalendar({
  appointments,
  onEventClick,
  role,
}: AppointmentCalendarProps) {
  const router = useRouter();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Transform appointments to calendar events
  const events: AppointmentEvent[] = appointments.map((apt) => {
    const start = new Date(apt.scheduledAt);
    // Default duration 30 mins if not specified (or calculate from end time if available)
    const end = new Date(start.getTime() + 30 * 60000);

    let title = "";
    if (role === "admin") {
      title = `${apt.patient?.name || "Unknown"} with ${apt.doctor?.name || "Unknown"}`;
    } else {
      title = `${apt.patient?.name || "Patient"}`; // Doctor sees patient name
    }

    return {
      id: apt.id,
      title,
      start,
      end,
      resource: apt,
      status: apt.status,
    };
  });

  const eventStyleGetter = (event: AppointmentEvent) => {
    let backgroundColor = "#3174ad";
    switch (event.status) {
      case "CONFIRMED":
        backgroundColor = "#10b981"; // green
        break;
      case "PENDING":
      case "REQUESTED":
        backgroundColor = "#f59e0b"; // amber
        break;
      case "CANCELLED":
        backgroundColor = "#ef4444"; // red
        break;
      case "COMPLETED":
        backgroundColor = "#6b7280"; // gray
        break;
      case "IN_PROGRESS":
        backgroundColor = "#3b82f6"; // blue
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: AppointmentEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      // Default navigation
      if (role === "admin") {
        router.push(`/admin/appointments/${event.id}`);
      } else {
        router.push(`/doctor/appointments/${event.id}`);
      }
    }
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      />
    </div>
  );
}
