'use server'

import { headers } from 'next/headers'
import { waitlistSchema } from '@/src/server/validators/waitlist.validator'
import { joinWaitlist, getWaitlistCount } from '@/src/server/services/waitlist.service'
import { success, failure, type Result } from '@/src/types/result'

export async function joinWaitlistAction(rawInput: unknown): Promise<Result<{ message: string; email: string }>> {
  const parsed = waitlistSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid waitlist submission', parsed.error.flatten().fieldErrors)
  }

  const headerStore = await headers()
  const clientIp =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'
  const userAgent = headerStore.get('user-agent') || undefined

  try {
    const result = await joinWaitlist(parsed.data, clientIp, userAgent)
    return success({
      message: result.message,
      email: result.email,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to join waitlist'
    if (message.startsWith('RATE_LIMITED')) {
      return failure('RATE_LIMITED', message)
    }
    return failure('INTERNAL_ERROR', message)
  }
}

export async function getLiveWaitlistCountAction(): Promise<Result<{ count: number }>> {
  try {
    const count = await getWaitlistCount()
    return success({ count })
  } catch {
    return success({ count: 1200 })
  }
}
