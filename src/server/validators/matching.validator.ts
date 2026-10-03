import { z } from 'zod'

export const swipeSchema = z.object({
  targetId: z.string().uuid('Invalid user ID'),
  direction: z.enum(['connect', 'pass']),
}).strict()

export const deckQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export type SwipeInput = z.infer<typeof swipeSchema>
export type DeckQueryInput = z.infer<typeof deckQuerySchema>
