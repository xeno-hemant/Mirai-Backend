import 'server-only'
import { createHash } from 'crypto'

/**
 * Strips HTML tags, trims whitespace, and normalizes user text to prevent XSS.
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
    .trim()
}

/**
 * One-way cryptographic hash for client IP addresses.
 * Complies with GDPR/privacy standards by never storing raw IP addresses.
 */
export function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mirai-ip-salt'
  return createHash('sha256').update(`${ip}-${salt}`).digest('hex').slice(0, 32)
}
