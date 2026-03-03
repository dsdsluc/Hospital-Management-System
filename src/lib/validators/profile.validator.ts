import { z } from 'zod'
import { Gender, Role } from '@prisma/client'

export const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1, 'Old password required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const baseUserUpdateSchema = z.object({
  email: z.string().email().optional(),
})

export const doctorProfileUpdateSchema = baseUserUpdateSchema.extend({
  name: z.string().min(2).optional(),
  specialization: z.string().min(2).optional(),
  contact: z.string().optional().nullable(),
}).strict()

export const patientProfileUpdateSchema = baseUserUpdateSchema.extend({
  name: z.string().min(2).optional(),
  dob: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  contact: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
}).strict()

export const adminProfileUpdateSchema = baseUserUpdateSchema.strict()

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type DoctorProfileUpdateInput = z.infer<typeof doctorProfileUpdateSchema>
export type PatientProfileUpdateInput = z.infer<typeof patientProfileUpdateSchema>
export type AdminProfileUpdateInput = z.infer<typeof adminProfileUpdateSchema>

export function getProfileUpdateSchema(role: Role) {
  switch (role) {
    case 'DOCTOR':
      return doctorProfileUpdateSchema
    case 'PATIENT':
      return patientProfileUpdateSchema
    case 'ADMIN':
    default:
      return adminProfileUpdateSchema
  }
}

