import { z } from 'zod'

export const roleEnumSchema = z.enum(['founder', 'builder', 'student'])

export const signUpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase().max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  role: roleEnumSchema,
  acceptedTerms: z.literal(true, {
    message: 'You must accept the terms of service',
  }),
  acceptedPrivacy: z.literal(true, {
    message: 'You must accept the privacy policy',
  }),
}).strict()

export const signInSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
}).strict()

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
}).strict()

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
}).strict()

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>
