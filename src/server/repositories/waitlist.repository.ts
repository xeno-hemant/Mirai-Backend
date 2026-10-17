import 'server-only'

import { createAdminClient } from '@/src/lib/supabase/admin'
import { getRedis } from '@/src/server/security/rateLimit'
import type { Database } from '@/src/types/database'

export type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert']
export type WaitlistRow = Database['public']['Tables']['waitlist']['Row']

// In-memory fallback cache
const fallbackStore = new Map<string, WaitlistRow>()

async function queryWithTimeout<T>(thenable: PromiseLike<T>, ms = 1200): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  })
  try {
    return await Promise.race([Promise.resolve(thenable), timeoutPromise])
  } finally {
    clearTimeout(timer!)
  }
}

export async function countActiveWaitlist(): Promise<number> {
  // Check Redis / fallback store first for fast response
  try {
    const redis = getRedis()
    if (redis) {
      const redisCount = await redis.scard('mirai:waitlist_emails')
      if (typeof redisCount === 'number' && redisCount > 0) {
        return 1200 + redisCount
      }
    }
  } catch {
    // Redis unavailable
  }

  try {
    const adminClient = createAdminClient()
    const { count, error } = await queryWithTimeout(
      adminClient.from('waitlist').select('*', { count: 'exact', head: true }).is('deleted_at', null)
    )

    if (!error && typeof count === 'number') {
      return Math.max(1200, count)
    }
  } catch {
    // Supabase unavailable or timed out
  }

  return 1200 + fallbackStore.size
}

export async function findWaitlistByEmail(email: string): Promise<WaitlistRow | null> {
  const normalizedEmail = email.toLowerCase()

  // 1. Check fallback memory store first (instant)
  if (fallbackStore.has(normalizedEmail)) {
    return fallbackStore.get(normalizedEmail)!
  }

  // 2. Check durable Upstash Redis (fast ~30-50ms)
  try {
    const redis = getRedis()
    if (redis) {
      const exists = await redis.sismember('mirai:waitlist_emails', normalizedEmail)
      if (exists) {
        const raw = await redis.get<string | object>(`mirai:waitlist_entry:${normalizedEmail}`)
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          return parsed as WaitlistRow
        }
      }
    }
  } catch (err) {
    console.warn('Redis lookup warning:', err)
  }

  // 3. Check Supabase with strict timeout so it never hangs
  try {
    const adminClient = createAdminClient()
    const { data, error } = await queryWithTimeout(
      adminClient
        .from('waitlist')
        .select('*')
        .eq('email', normalizedEmail)
        .is('deleted_at', null)
        .maybeSingle()
    )

    if (!error && data) {
      return data
    }
  } catch {
    // Supabase table not created or timed out
  }

  return null
}

export async function insertWaitlistEntry(entry: WaitlistInsert): Promise<WaitlistRow> {
  const normalizedEmail = entry.email.toLowerCase()
  const now = new Date().toISOString()

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

  // 1. Store in memory and durable Upstash Redis first (instant guarantee)
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

  // 2. Persist to Supabase with timeout (non-blocking for overall request)
  try {
    const adminClient = createAdminClient()
    const { data, error } = await queryWithTimeout(
      adminClient
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
        .single(),
      1200
    )

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.warn('Supabase insert timed out or failed (persisted in Redis):', err)
  }

  return fallbackRow
}
