import 'server-only'

import { createAdminClient } from '@/src/lib/supabase/admin'
import type { Database } from '@/src/types/database'

export type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert']
export type WaitlistRow = Database['public']['Tables']['waitlist']['Row']

export async function countActiveWaitlist(): Promise<number> {
  const adminClient = createAdminClient()
  const { count, error } = await adminClient
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  if (error) {
    console.error('Failed to count waitlist:', error)
    return 1200 // Fallback to baseline counter
  }

  return Math.max(1200, count ?? 1200)
}

export async function findWaitlistByEmail(email: string): Promise<WaitlistRow | null> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('waitlist')
    .select('*')
    .eq('email', email.toLowerCase())
    .is('deleted_at', null)
    .maybeSingle()

  return data
}

export async function insertWaitlistEntry(entry: WaitlistInsert): Promise<WaitlistRow> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('waitlist')
    .insert({
      email: entry.email.toLowerCase(),
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

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to insert waitlist entry')
  }

  return data
}
