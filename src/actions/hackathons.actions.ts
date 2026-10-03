'use server'

import { requireUser } from '@/src/server/auth/guards'
import { registerHackathonSchema, createTeamSchema } from '@/src/server/validators/hackathons.validator'
import { registerForEvent, createTeamForEvent } from '@/src/server/services/hackathons.service'
import { success, failure, type Result } from '@/src/types/result'
import type { Database } from '@/src/types/database'

export type TeamDto = Database['public']['Tables']['hackathon_teams']['Row']

export async function registerHackathonAction(rawInput: unknown): Promise<Result<{ registered: boolean }>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = registerHackathonSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid registration parameters', parsed.error.flatten().fieldErrors)
  }

  try {
    const res = await registerForEvent(
      context.profile.id,
      context.authUser.email ?? '',
      context.profile.full_name,
      parsed.data
    )
    return success({ registered: res.registered })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return failure('INTERNAL_ERROR', message)
  }
}

export async function createTeamAction(rawInput: unknown): Promise<Result<TeamDto>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = createTeamSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid team creation parameters', parsed.error.flatten().fieldErrors)
  }

  try {
    const team = await createTeamForEvent(context.profile.id, parsed.data)
    return success(team)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Team creation failed'
    return failure('INTERNAL_ERROR', message)
  }
}
