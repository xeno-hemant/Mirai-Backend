import 'server-only'

import { createClient } from '@/src/lib/supabase/server'
import { createAdminClient } from '@/src/lib/supabase/admin'
import { LEGAL_CONFIG } from '@/src/config/legal'
import type { Database } from '@/src/types/database'

export type UserRow = Database['public']['Tables']['users']['Row']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export async function getUserById(id: string): Promise<UserRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user by id:', error)
    return null
  }
  return data
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
  return data
}

export async function updateUserProfile(id: string, updates: Partial<UserUpdate>): Promise<UserRow> {
  const supabase = await createClient()
  
  // Strip immutable / security fields
  const safeUpdates: Partial<UserUpdate> = {
    headline: updates.headline,
    bio: updates.bio,
    avatar_url: updates.avatar_url,
    skills: updates.skills,
    interests: updates.interests,
    commitment_level: updates.commitment_level,
    location: updates.location,
    open_to_remote: updates.open_to_remote,
    links: updates.links,
    onboarding_completed: updates.onboarding_completed,
  }

  const { data, error } = await supabase
    .from('users')
    .update(safeUpdates)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update profile')
  }

  return data
}

/**
 * Compliance: Soft-deletes user profile and scrubs direct PII
 */
export async function softDeleteUser(id: string, authUserId: string): Promise<void> {
  const adminClient = createAdminClient()

  // 1. Soft delete public profile and scrub PII
  const { error: profileError } = await adminClient
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
      full_name: 'Deleted User',
      username: `deleted_${id.slice(0, 8)}`,
      headline: null,
      bio: null,
      avatar_url: null,
      links: {},
    })
    .eq('id', id)

  if (profileError) {
    throw new Error(`Profile soft-delete failed: ${profileError.message}`)
  }

  // 2. Cascade soft delete to user content (startups, comments, likes)
  await adminClient.from('startups').update({ deleted_at: new Date().toISOString() }).eq('owner_id', id)
  await adminClient.from('community_posts').update({ deleted_at: new Date().toISOString() }).eq('author_id', id)
  await adminClient.from('post_comments').update({ deleted_at: new Date().toISOString() }).eq('author_id', id)
  await adminClient.from('post_likes').update({ deleted_at: new Date().toISOString() }).eq('user_id', id)
  await adminClient.from('swipes').update({ deleted_at: new Date().toISOString() }).eq('swiper_id', id)

  // 3. Disable auth user
  await adminClient.auth.admin.deleteUser(authUserId, true)
}

/**
 * Compliance: GDPR / Data Export
 */
export async function exportUserData(id: string): Promise<Record<string, unknown>> {
  const supabase = await createClient()

  const [userRes, startupsRes, postsRes, matchesRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', id).single(),
    supabase.from('startups').select('*').eq('owner_id', id),
    supabase.from('community_posts').select('*').eq('author_id', id),
    supabase.from('matches').select('*').or(`user_a_id.eq.${id},user_b_id.eq.${id}`),
  ])

  return {
    profile: userRes.data,
    startups: startupsRes.data ?? [],
    posts: postsRes.data ?? [],
    matches: matchesRes.data ?? [],
    exported_at: new Date().toISOString(),
    legal: {
      terms_version: LEGAL_CONFIG.TERMS_VERSION,
      privacy_version: LEGAL_CONFIG.PRIVACY_VERSION,
    },
  }
}
