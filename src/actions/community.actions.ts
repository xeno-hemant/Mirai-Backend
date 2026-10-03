'use server'

import { requireUser } from '@/src/server/auth/guards'
import { createPostSchema, createCommentSchema } from '@/src/server/validators/community.validator'
import { publishPost, handleToggleLike, postComment } from '@/src/server/services/community.service'
import { success, failure, type Result } from '@/src/types/result'
import type { Database } from '@/src/types/database'

export type PostDto = Database['public']['Tables']['community_posts']['Row']
export type CommentDto = Database['public']['Tables']['post_comments']['Row']

export async function createPostAction(rawInput: unknown): Promise<Result<PostDto>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = createPostSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid post content', parsed.error.flatten().fieldErrors)
  }

  try {
    const post = await publishPost(context.profile.id, parsed.data)
    return success(post)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Post publication failed'
    return failure('INTERNAL_ERROR', message)
  }
}

export async function toggleLikeAction(postId: string): Promise<Result<{ liked: boolean }>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  try {
    const res = await handleToggleLike(context.profile.id, postId)
    return success(res)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Toggle like failed'
    return failure('INTERNAL_ERROR', message)
  }
}

export async function addCommentAction(rawInput: unknown): Promise<Result<CommentDto>> {
  let context
  try {
    context = await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = createCommentSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid comment body', parsed.error.flatten().fieldErrors)
  }

  try {
    const comment = await postComment(context.profile.id, parsed.data)
    return success(comment)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Comment submission failed'
    return failure('INTERNAL_ERROR', message)
  }
}
