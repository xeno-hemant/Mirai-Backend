import { z } from 'zod'

export const startupStageSchema = z.enum(['idea', 'prototype', 'mvp'])

export const createStartupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  tagline: z.string().trim().min(5, 'Tagline must be at least 5 characters').max(180),
  problem: z.string().trim().min(10, 'Problem statement must be at least 10 characters').max(2000),
  solution: z.string().trim().min(10, 'Solution statement must be at least 10 characters').max(2000),
  stage: startupStageSchema.default('idea'),
  industry: z.string().trim().min(2).max(60),
  location: z.string().trim().max(100).optional().nullable(),
  tags: z.array(z.string().trim().max(30)).max(10).default([]),
  looking_for: z.array(z.string().trim().max(50)).max(10).default([]),
  website_url: z.string().trim().url('Must be a valid URL starting with https://').startsWith('https://').max(255).optional().nullable(),
  pitch_deck_path: z.string().trim().max(255).optional().nullable(),
  logo_url: z.string().trim().url().startsWith('https://').max(500).optional().nullable(),
}).strict()

export const updateStartupSchema = createStartupSchema.partial().strict()

export const listStartupsQuerySchema = z.object({
  stage: startupStageSchema.optional(),
  industry: z.string().trim().optional(),
  location: z.string().trim().optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export type CreateStartupInput = z.infer<typeof createStartupSchema>
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>
export type ListStartupsQuery = z.infer<typeof listStartupsQuerySchema>
