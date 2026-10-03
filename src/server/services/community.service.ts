import 'server-only'

import {
  listPosts,
  getPostById,
  insertPost,
  togglePostLike,
  insertComment,
  type PostRow,
} from '../repositories/community.repository'
import { sanitizeText } from '../security/sanitize'
import type { CreatePostInput, CreateCommentInput, ListFeedInput } from '../validators/community.validator'

export async function fetchFeed(query: ListFeedInput) {
  return await listPosts({
    groupId: query.groupId,
    cursor: query.cursor,
    limit: query.limit,
  })
}

export async function fetchPostDetails(id: string): Promise<PostRow | null> {
  return await getPostById(id)
}

export async function publishPost(authorId: string, input: CreatePostInput): Promise<PostRow> {
  return await insertPost({
    author_id: authorId,
    group_id: input.groupId ?? null,
    type: input.type,
    title: sanitizeText(input.title),
    body: sanitizeText(input.body),
    media_url: input.media_url ?? null,
    like_count: 0,
    comment_count: 0,
  })
}

export async function handleToggleLike(userId: string, postId: string) {
  return await togglePostLike(postId, userId)
}

export async function postComment(authorId: string, input: CreateCommentInput) {
  return await insertComment(input.postId, authorId, sanitizeText(input.body))
}
