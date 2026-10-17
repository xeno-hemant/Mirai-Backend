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

  // 1. Rate limiting: relax for localhost / development
  const isLocalOrDev =
    process.env.NODE_ENV !== 'production' ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp === 'localhost'

  const ipMax = isLocalOrDev ? 100 : 10
  const ipLimit = await rateLimit(`waitlist:ip:${clientIp}`, ipMax, 3600 * 1000)
  if (!ipLimit.success) {
    throw new Error('RATE_LIMITED: Too many submissions from this connection.')
  }

  // Rate limiting: 10 submissions per day per email (relaxed for testing)
  const emailMax = isLocalOrDev ? 50 : 10
  const emailLimit = await rateLimit(`waitlist:email:${email}`, emailMax, 86400 * 1000)
  if (!emailLimit.success) {
    throw new Error('RATE_LIMITED: Too many submissions for this email.')
  }

  // 2. Check idempotency (Already joined)
  const existing = await findWaitlistByEmail(email)
  if (existing) {
    // Re-dispatch confirmation email so the user receives their confirmation
    try {
      const emailContent = waitlistConfirmationTemplate({
        email: existing.email,
        role: existing.role_interest,
      })
      const emailResult = await sendEmail({
        to: existing.email,
        content: emailContent,
        idempotencyKey: `waitlist-${existing.id}-${Date.now()}`,
      })
      if (emailResult.success) {
        console.log(`[Waitlist] Re-sent confirmation email to existing member: ${existing.email}`)
      } else {
        console.warn(`[Waitlist] Could not re-send confirmation email to: ${existing.email}`)
      }
    } catch (err) {
      console.error('Confirmation email resend failure for existing member:', err)
    }

    return {
      status: 'already_joined' as const,
      message: "You're already on the waitlist! We've sent your confirmation email.",
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
    const emailResult = await sendEmail({
      to: entry.email,
      content: emailContent,
      idempotencyKey: `waitlist-${entry.id}-${Date.now()}`,
    })
    if (emailResult.success) {
      console.log(`[Waitlist] Confirmation email sent successfully to ${entry.email} (ID: ${emailResult.id})`)
    } else {
      console.error(`[Waitlist] Failed to send confirmation email to ${entry.email}`)
    }
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
    message: `Welcome${input.role ? `, ${input.role.toLowerCase()}` : ''}. You're on the list! We've sent a confirmation email to your inbox.`,
    email,
  }
}
