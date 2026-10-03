import { z } from 'zod'

export const registerHackathonSchema = z.object({
  hackathonId: z.string().uuid('Invalid hackathon ID'),
  teamId: z.string().uuid().optional().nullable(),
}).strict()

export const createTeamSchema = z.object({
  hackathonId: z.string().uuid('Invalid hackathon ID'),
  name: z.string().trim().min(2, 'Team name must be at least 2 characters').max(60),
  projectTitle: z.string().trim().max(120).optional().nullable(),
  projectDescription: z.string().trim().max(2000).optional().nullable(),
}).strict()

export const listHackathonsSchema = z.object({
  status: z.enum(['upcoming', 'live', 'completed']).optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export type RegisterHackathonInput = z.infer<typeof registerHackathonSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type ListHackathonsInput = z.infer<typeof listHackathonsSchema>
