import { z } from 'zod'

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase()
    .max(255),
  role: z.enum(['founder', 'builder', 'student']).optional().default('builder'),
  source: z.string().trim().max(100).optional().default('landing_page'),
  // Honeypot field (hidden bot trap)
  website_trap: z.string().max(0, 'Spam detected').optional(),
  // Acceptance can be passed by client or defaulted server-side per Section 6 UI GAPS rule
  acceptedTerms: z.boolean().optional().default(true),
  acceptedPrivacy: z.boolean().optional().default(true),
}).strict()

export type WaitlistInput = z.infer<typeof waitlistSchema>
