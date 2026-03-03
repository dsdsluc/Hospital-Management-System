import { z } from 'zod';

const baseUserFields = {
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
};

export const RegisterSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('DOCTOR'),
    ...baseUserFields,
    // departmentId removed, handled by admin
  }),
  z.object({
    role: z.literal('PATIENT'),
    ...baseUserFields,
    phone: z.string().min(7, 'Phone is required'),
  }),
]);

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
