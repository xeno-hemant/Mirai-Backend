import 'server-only'

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database'

export type PostRow = Database['public']['Tables']['community_posts']['Row']
export type PostInsert = Database['public']['Tables']['community_posts']['Insert']
export type CommentRow = Database['public']['Tables']['post_comments']['Row']

export async function listPosts(params: {
  groupId?: string
  cursor?: string
  limit?: number
}): Promise<{ items: PostRow[]; nextCursor: string | null }> {
  const supabase = await createClient()
  const limit = Math.min(params.limit ?? 20, 50)

  let query = supabase
    .from('community_posts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (params.groupId) {
    query = query.eq('group_id', params.groupId)
  }
  if (params.cursor) {
    query = query.lt('created_at', params.cursor)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('Failed to list community posts:', error)
    return { items: [], nextCursor: null }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].created_at : null

  return { items, nextCursor }
}

export async function getPostById(id: string): Promise<PostRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error(`Failed to get post ${id}:`, error)
    return null
  }
  return data
}

export async function insertPost(post: PostInsert): Promise<PostRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create post')
  }

  return data
}

export async function togglePostLike(postId: string, userId: string): Promise<{ liked: boolean }> {
  const supabase = await createClient()

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id)
    return { liked: false }
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
    return { liked: true }
  }
}

export async function insertComment(postId: string, authorId: string, body: string): Promise<CommentRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      body,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create comment')
  }

  return data
}
