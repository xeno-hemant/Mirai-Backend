import 'server-only'

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database'

export type HackathonRow = Database['public']['Tables']['hackathons']['Row']
export type TeamRow = Database['public']['Tables']['hackathon_teams']['Row']
export type RegistrationRow = Database['public']['Tables']['hackathon_registrations']['Row']

export async function listHackathons(params: {
  status?: 'upcoming' | 'live' | 'completed'
  cursor?: string
  limit?: number
}): Promise<{ items: HackathonRow[]; nextCursor: string | null }> {
  const supabase = await createClient()
  const limit = Math.min(params.limit ?? 20, 50)

  let query = supabase
    .from('hackathons')
    .select('*')
    .is('deleted_at', null)
    .order('starts_at', { ascending: true })
    .limit(limit + 1)

  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.cursor) {
    query = query.gt('starts_at', params.cursor)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('Failed to list hackathons:', error)
    return { items: [], nextCursor: null }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].starts_at : null

  return { items, nextCursor }
}

export async function getHackathonBySlug(slug: string): Promise<HackathonRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error(`Failed to get hackathon ${slug}:`, error)
    return null
  }
  return data
}

export async function registerUserForHackathon(
  hackathonId: string,
  userId: string,
  teamId?: string | null
): Promise<{ registered: boolean; isNew: boolean }> {
  const supabase = await createClient()

  // Idempotency: upsert or ignore duplicate
  const { data: existing } = await supabase
    .from('hackathon_registrations')
    .select('id')
    .eq('hackathon_id', hackathonId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing) {
    return { registered: true, isNew: false }
  }

  const { error } = await supabase.from('hackathon_registrations').insert({
    hackathon_id: hackathonId,
    user_id: userId,
    team_id: teamId ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return { registered: true, isNew: true }
}

export async function createHackathonTeam(params: {
  hackathonId: string
  leadUserId: string
  name: string
  projectTitle?: string | null
  projectDescription?: string | null
}): Promise<TeamRow> {
  const supabase = await createClient()

  // 1. Create team
  const { data: team, error: teamErr } = await supabase
    .from('hackathon_teams')
    .insert({
      hackathon_id: params.hackathonId,
      name: params.name,
      project_title: params.projectTitle ?? null,
      project_description: params.projectDescription ?? null,
      points: 0,
    })
    .select()
    .single()

  if (teamErr || !team) {
    throw new Error(teamErr?.message ?? 'Failed to create team')
  }

  // 2. Add lead as team member
  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: params.leadUserId,
    is_lead: true,
  })

  // 3. Update registration if exists
  await supabase
    .from('hackathon_registrations')
    .update({ team_id: team.id })
    .eq('hackathon_id', params.hackathonId)
    .eq('user_id', params.leadUserId)

  return team
}

export async function getLeaderboard(hackathonId: string, limit = 20): Promise<TeamRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hackathon_teams')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .is('deleted_at', null)
    .order('points', { ascending: false })
    .order('created_at', { ascending: true }) // Tie breaker: earlier creation
    .limit(limit)

  if (error || !data) {
    return []
  }
  return data
}
