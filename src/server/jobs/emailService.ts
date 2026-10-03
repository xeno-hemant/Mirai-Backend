import 'server-only'

import { Resend } from 'resend'
import { getServerEnv } from '@/src/config/env'
import type { EmailContent } from './emails/templates'

let resendInstance: Resend | null = null

function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance
  const env = getServerEnv()
  if (!env.RESEND_API_KEY) {
    return null
  }
  resendInstance = new Resend(env.RESEND_API_KEY)
  return resendInstance
}

export async function sendEmail(params: {
  to: string
  content: EmailContent
  idempotencyKey?: string
}): Promise<{ success: boolean; id?: string }> {
  try {
    const resend = getResendClient()
    const env = getServerEnv()

    if (!resend) {
      console.log(`[DEV EMAIL SIMULATION] To: ${params.to} | Subject: ${params.content.subject}`)
      return { success: true, id: `sim_${Date.now()}` }
    }

    let sender = env.EMAIL_FROM || 'Mirai <onboarding@resend.dev>'
    let res = await resend.emails.send({
      from: sender,
      to: params.to,
      subject: params.content.subject,
      html: params.content.html,
      text: params.content.text,
      headers: params.idempotencyKey ? { 'X-Entity-Ref-ID': params.idempotencyKey } : undefined,
    })

    // If custom domain is not verified, fallback to onboarding@resend.dev
    if (res.error && (res.error.message?.includes('not verified') || res.error.statusCode === 403)) {
      console.warn(`[Resend] Domain unverified, falling back to onboarding@resend.dev for ${params.to}`)
      res = await resend.emails.send({
        from: 'Mirai <onboarding@resend.dev>',
        to: params.to,
        subject: params.content.subject,
        html: params.content.html,
        text: params.content.text,
        headers: params.idempotencyKey ? { 'X-Entity-Ref-ID': params.idempotencyKey } : undefined,
      })
    }

    if (res.error) {
      console.error('Resend delivery error:', res.error)
      return { success: false }
    }

    console.log(`[Resend] Email successfully sent to ${params.to} (ID: ${res.data?.id})`)
    return { success: true, id: res.data?.id }
  } catch (err) {
    console.error('Fatal email dispatch failure (dead-letter logged):', err)
    return { success: false }
  }
}
