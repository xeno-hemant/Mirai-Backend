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

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.content.subject,
      html: params.content.html,
      text: params.content.text,
      headers: params.idempotencyKey ? { 'X-Entity-Ref-ID': params.idempotencyKey } : undefined,
    })

    if (error) {
      console.error('Resend delivery error:', error)
      return { success: false }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Fatal email dispatch failure (dead-letter logged):', err)
    return { success: false }
  }
}
