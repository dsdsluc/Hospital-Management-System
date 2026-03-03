import { z } from 'zod';

export const createDoctorSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  departmentId: z.string().min(1, 'Department is required'),
  licenseNumber: z.string().optional(), // Made optional
});

export const updateDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  specialization: z.string().min(2, 'Specialization is required').optional(),
  departmentId: z.string().min(1, 'Department is required').optional(),
  licenseNumber: z.string().optional(), // Made optional
});

export const doctorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL']).optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
  headDoctorId: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
  description: z.string().optional(),
  headDoctorId: z.string().optional(),
});

export const patientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  primaryDoctorId: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

export const appointmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['BOOKED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['BOOKED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']),
});
