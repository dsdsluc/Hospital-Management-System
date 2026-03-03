import { z } from "zod";

export const doctorAppointmentQuerySchema = z.object({
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

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
    "RESCHEDULED",
  ]),
});

export const completeAppointmentSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().optional(),
  prescription: z
    .object({
      medications: z
        .array(
          z.object({
            name: z.string().min(1),
            dosage: z.string().min(1),
            freq: z.string().min(1),
            duration: z.string().min(1),
          }),
        )
        .optional(),
      instructions: z.string().optional(),
    })
    .optional(),
});
