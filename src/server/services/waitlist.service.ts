import 'server-only'

import { countActiveWaitlist, findWaitlistByEmail, insertWaitlistEntry } from '../repositories/waitlist.repository'
import { rateLimit } from '../security/rateLimit'
import { hashIp, sanitizeText } from '../security/sanitize'
import { LEGAL_CONFIG } from '@/src/config/legal'
import { inngest } from '../jobs/client'
import { sendEmail } from '../jobs/emailService'
import { waitlistConfirmationTemplate } from '../jobs/emails/templates'
import type { WaitlistInput } from '../validators/waitlist.validator'

export async function getWaitlistCount(): Promise<number> {
  return await countActiveWaitlist()
}

export async function joinWaitlist(input: WaitlistInput, clientIp: string, userAgent?: string) {
  const email = sanitizeText(input.email).toLowerCase()

  // 1. Rate limiting: 5 per hour per IP
  const ipLimit = await rateLimit(`waitlist:ip:${clientIp}`, 5, 3600 * 1000)
  if (!ipLimit.success) {
    throw new Error('RATE_LIMITED: Too many submissions from this connection.')
  }

  // Rate limiting: 3 per day per email
  const emailLimit = await rateLimit(`waitlist:email:${email}`, 3, 86400 * 1000)
  if (!emailLimit.success) {
    throw new Error('RATE_LIMITED: Too many submissions for this email.')
  }

  // 2. Check idempotency (Already joined)
  const existing = await findWaitlistByEmail(email)
  if (existing) {
    return {
      status: 'already_joined' as const,
      message: 'You are already on the list.',
      email,
    }
  }

  // 3. Insert into database with immutable server timestamps and hashed IP
  const now = new Date().toISOString()
  const entry = await insertWaitlistEntry({
    email,
    role_interest: input.role ?? 'builder',
    source: input.source ?? 'landing_page',
    accepted_terms_at: now,
    accepted_privacy_at: now,
    terms_version: LEGAL_CONFIG.TERMS_VERSION,
    privacy_version: LEGAL_CONFIG.PRIVACY_VERSION,
    ip_hash: hashIp(clientIp),
    user_agent: userAgent ? userAgent.slice(0, 255) : null,
  })

  // 4. Send Confirmation Email directly via Resend
  try {
    const emailContent = waitlistConfirmationTemplate({
      email: entry.email,
      role: entry.role_interest,
    })
    await sendEmail({
      to: entry.email,
      content: emailContent,
      idempotencyKey: `waitlist-${entry.id}`,
    })
  } catch (err) {
    console.error('Direct email dispatch failure:', err)
  }

  // 5. Trigger Inngest background event (non-blocking)
  try {
    await inngest.send({
      name: 'waitlist/joined',
      data: {
        waitlistId: entry.id,
        email: entry.email,
        role: entry.role_interest,
      },
    })
  } catch (err) {
    console.error('Failed to dispatch Inngest waitlist/joined event (graceful fallback):', err)
  }

  return {
    status: 'joined' as const,
    message: `Welcome${input.role ? `, ${input.role.toLowerCase()}` : ''}. You are on the list.`,
    email,
  }
}
