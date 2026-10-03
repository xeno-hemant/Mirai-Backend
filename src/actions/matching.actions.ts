'use server'

import { requireUser } from '@/src/server/auth/guards'
import { swipeSchema } from '@/src/server/validators/matching.validator'
import { processSwipe } from '@/src/server/services/matching.service'
import { success, failure, type Result } from '@/src/types/result'

export async function swipeAction(rawInput: unknown): Promise<Result<{ isMatch: boolean; matchId: string | null }>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = swipeSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid swipe data', parsed.error.flatten().fieldErrors)
  }

  if (context.profile.id === parsed.data.targetId) {
    return failure('BAD_REQUEST', 'Cannot swipe on yourself')
  }

  try {
    const result = await processSwipe(context.profile.id, parsed.data.targetId, parsed.data.direction)
    return success(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Swipe processing failed'
    return failure('INTERNAL_ERROR', message)
  }
}
