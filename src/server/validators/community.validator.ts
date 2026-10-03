import { z } from 'zod'

export const postTypeSchema = z.enum(['post', 'ama', 'startup_of_the_week'])

export const createPostSchema = z.object({
  groupId: z.string().uuid().optional().nullable(),
  type: postTypeSchema.default('post'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  body: z.string().trim().min(5, 'Post body must be at least 5 characters').max(10000),
  media_url: z.string().trim().url().startsWith('https://').max(500).optional().nullable(),
}).strict()

export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  body: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
}).strict()

export const listFeedSchema = z.object({
  groupId: z.string().uuid().optional(),
  type: postTypeSchema.optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type ListFeedInput = z.infer<typeof listFeedSchema>
