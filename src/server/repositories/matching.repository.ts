import 'server-only'

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database'

export type UserRow = Database['public']['Tables']['users']['Row']
export type SwipeDirection = Database['public']['Enums']['swipe_direction']

export interface SwipeMatchResult {
  isMatch: boolean
  matchId: string | null
}

export async function getCandidateDeck(params: {
  userId: string
  cursor?: string
  limit?: number
}): Promise<{ items: UserRow[]; nextCursor: string | null }> {
  const supabase = await createClient()
  const limit = Math.min(params.limit ?? 20, 50)

  // 1. Get IDs of users already swiped by this user
  const { data: swiped } = await supabase
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', params.userId)

  const swipedIds = (swiped ?? []).map((s) => s.target_id)
  const excludedIds = [params.userId, ...swipedIds]

  // 2. Fetch candidate profiles
  let query = supabase
    .from('users')
    .select('*')
    .is('deleted_at', null)
    .not('id', 'in', `(${excludedIds.join(',')})`)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (params.cursor) {
    query = query.lt('created_at', params.cursor)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('Failed to load candidate deck:', error)
    return { items: [], nextCursor: null }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].created_at : null

  return { items, nextCursor }
}

export async function executeSwipe(params: {
  swiperId: string
  targetId: string
  direction: SwipeDirection
  compatibilityScore?: number
}): Promise<SwipeMatchResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('record_swipe_and_match', {
    p_swiper_id: params.swiperId,
    p_target_id: params.targetId,
    p_direction: params.direction,
    p_score: params.compatibilityScore ?? 85,
  })

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to execute swipe')
  }

  return {
    isMatch: data.is_match,
    matchId: data.match_id,
  }
}
