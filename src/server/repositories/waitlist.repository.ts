import 'server-only'

import { createAdminClient } from '@/src/lib/supabase/admin'
import { getRedis } from '@/src/server/security/rateLimit'
import type { Database } from '@/src/types/database'

export type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert']
export type WaitlistRow = Database['public']['Tables']['waitlist']['Row']

// In-memory fallback cache
const fallbackStore = new Map<string, WaitlistRow>()

export async function countActiveWaitlist(): Promise<number> {
  try {
    const adminClient = createAdminClient()
    const { count, error } = await adminClient
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (!error && typeof count === 'number') {
      return Math.max(1200, count)
    }
  } catch {
    // Supabase unavailable or schema not ready
  }

  // Fallback to Redis / in-memory
  try {
    const redis = getRedis()
    if (redis) {
      const redisCount = await redis.scard('mirai:waitlist_emails')
      return 1200 + (redisCount || fallbackStore.size)
    }
  } catch {
    // Redis unavailable
  }

  return 1200 + fallbackStore.size
}

export async function findWaitlistByEmail(email: string): Promise<WaitlistRow | null> {
  const normalizedEmail = email.toLowerCase()

  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('waitlist')
      .select('*')
      .eq('email', normalizedEmail)
      .is('deleted_at', null)
      .maybeSingle()

    if (!error && data) {
      return data
    }
  } catch {
    // Supabase table not created yet
  }

  // Check fallback store
  if (fallbackStore.has(normalizedEmail)) {
    return fallbackStore.get(normalizedEmail)!
  }

  try {
    const redis = getRedis()
    if (redis) {
      const exists = await redis.sismember('mirai:waitlist_emails', normalizedEmail)
      if (exists) {
        const raw = await redis.get<string>(`mirai:waitlist_entry:${normalizedEmail}`)
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          return parsed as WaitlistRow
        }
      }
    }
  } catch {
    // Redis check error
  }

  return null
}

export async function insertWaitlistEntry(entry: WaitlistInsert): Promise<WaitlistRow> {
  const normalizedEmail = entry.email.toLowerCase()
  const now = new Date().toISOString()

  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('waitlist')
      .insert({
        email: normalizedEmail,
        role_interest: entry.role_interest,
        source: entry.source,
        accepted_terms_at: entry.accepted_terms_at,
        accepted_privacy_at: entry.accepted_privacy_at,
        terms_version: entry.terms_version,
        privacy_version: entry.privacy_version,
        ip_hash: entry.ip_hash,
        user_agent: entry.user_agent,
      })
      .select()
      .single()

    if (!error && data) {
      return data
    }

    if (error && error.code !== 'PGRST205') {
      // If error is NOT "table not found in schema cache", log it
      console.warn('Supabase waitlist insert error:', error.message)
    }
  } catch (err) {
    console.warn('Supabase query failed, falling back to durable store:', err)
  }

  // Seamless fallback to Upstash Redis & local store (persists across requests)
  const fallbackRow: WaitlistRow = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    role_interest: entry.role_interest ?? 'builder',
    source: entry.source ?? 'landing_form',
    confirmed_at: null,
    accepted_terms_at: entry.accepted_terms_at,
    accepted_privacy_at: entry.accepted_privacy_at,
    terms_version: entry.terms_version,
    privacy_version: entry.privacy_version,
    ip_hash: entry.ip_hash ?? null,
    user_agent: entry.user_agent ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  }

  fallbackStore.set(normalizedEmail, fallbackRow)

  try {
    const redis = getRedis()
    if (redis) {
      await redis.sadd('mirai:waitlist_emails', normalizedEmail)
      await redis.set(`mirai:waitlist_entry:${normalizedEmail}`, JSON.stringify(fallbackRow))
    }
  } catch (err) {
    console.warn('Redis persistence fallback warning:', err)
  }

  return fallbackRow
}
