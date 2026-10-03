import 'server-only'

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database'

export type StartupRow = Database['public']['Tables']['startups']['Row']
export type StartupInsert = Database['public']['Tables']['startups']['Insert']
export type StartupUpdate = Database['public']['Tables']['startups']['Update']

export async function getFeaturedStartup(): Promise<StartupRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('is_featured', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed to get featured startup:', error)
    return null
  }
  return data
}

export async function getStartupBySlug(slug: string): Promise<StartupRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error(`Failed to find startup ${slug}:`, error)
    return null
  }
  return data
}

export async function listStartups(params: {
  stage?: 'idea' | 'prototype' | 'mvp'
  industry?: string
  location?: string
  cursor?: string
  limit?: number
}): Promise<{ items: StartupRow[]; nextCursor: string | null }> {
  const supabase = await createClient()
  const limit = Math.min(params.limit ?? 20, 50)

  let query = supabase
    .from('startups')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (params.stage) {
    query = query.eq('stage', params.stage)
  }
  if (params.industry) {
    query = query.ilike('industry', `%${params.industry}%`)
  }
  if (params.location) {
    query = query.ilike('location', `%${params.location}%`)
  }
  if (params.cursor) {
    query = query.lt('created_at', params.cursor)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('Error listing startups:', error)
    return { items: [], nextCursor: null }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].created_at : null

  return { items, nextCursor }
}

export async function insertStartup(startup: StartupInsert): Promise<StartupRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('startups')
    .insert(startup)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create startup')
  }

  return data
}

export async function updateStartup(id: string, updates: StartupUpdate): Promise<StartupRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('startups')
    .update(updates)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update startup')
  }

  return data
}
