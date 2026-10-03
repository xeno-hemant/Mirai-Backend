'use server'

import { requireUser } from '@/src/server/auth/guards'
import { createStartupSchema, updateStartupSchema } from '@/src/server/validators/startups.validator'
import { createNewStartup, editStartup } from '@/src/server/services/startups.service'
import { success, failure, type Result } from '@/src/types/result'
import type { Database } from '@/src/types/database'

export type StartupDto = Database['public']['Tables']['startups']['Row']

export async function createStartupAction(rawInput: unknown): Promise<Result<StartupDto>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = createStartupSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid startup details', parsed.error.flatten().fieldErrors)
  }

  try {
    const startup = await createNewStartup(context.profile.id, parsed.data)
    return success(startup)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Startup creation failed'
    return failure('INTERNAL_ERROR', message)
  }
}

export async function updateStartupAction(startupId: string, rawInput: unknown): Promise<Result<StartupDto>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = updateStartupSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid update parameters', parsed.error.flatten().fieldErrors)
  }

  try {
    const updated = await editStartup(context.profile.id, startupId, parsed.data)
    return success(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Startup update failed'
    return failure('INTERNAL_ERROR', message)
  }
}
