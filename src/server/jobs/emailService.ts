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
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    cid?: string
  }>
}): Promise<{ success: boolean; id?: string }> {
  try {
    const resend = getResendClient()
    const env = getServerEnv()

    if (!resend) {
      console.log(`[DEV EMAIL SIMULATION] To: ${params.to} | Subject: ${params.content.subject}`)
      return { success: true, id: `sim_${Date.now()}` }
    }

    const sender = params.from || env.EMAIL_FROM || 'Mirai <noreply@mymirai.site>'
    const replyTo = params.replyTo || 'support@mymirai.site'
    const attachments = params.attachments || params.content.attachments

    const payload: Parameters<typeof resend.emails.send>[0] = {
      from: sender,
      to: params.to,
      subject: params.content.subject,
      html: params.content.html,
      text: params.content.text,
      replyTo,
      headers: params.idempotencyKey ? { 'X-Entity-Ref-ID': params.idempotencyKey } : undefined,
    }

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments
    }

    const res = await resend.emails.send(payload)

    if (res.error) {
      console.error(`[Resend Error] Failed sending to ${params.to}:`, res.error)
      return { success: false }
    }

    console.log(`[Resend] Email successfully sent to ${params.to} (ID: ${res.data?.id})`)
    return { success: true, id: res.data?.id }
  } catch (err) {
    console.error('Fatal email dispatch failure (dead-letter logged):', err)
    return { success: false }
  }
}

