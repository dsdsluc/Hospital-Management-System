import { z } from "zod";

export const patientAppointmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum([
      "REQUESTED",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  departmentId: z.string().min(1, "Department is required"),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});
