import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getServerEnv } from '@/src/config/env'

let redisClient: Redis | null = null

export function getRedis(): Redis | null {
  if (redisClient) return redisClient
  const env = getServerEnv()
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  redisClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  })
  return redisClient
}

// In-memory fallback sliding window for local testing or when Upstash credentials are not set
const memoryStore = new Map<string, { timestamp: number }[]>()

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): { success: boolean; reset: number } {
  const now = Date.now()
  const records = (memoryStore.get(key) ?? []).filter((r) => now - r.timestamp < windowMs)
  if (records.length >= limit) {
    return { success: false, reset: records[0].timestamp + windowMs }
  }
  records.push({ timestamp: now })
  memoryStore.set(key, records)
  return { success: true, reset: now + windowMs }
}

export interface RateLimitResult {
  success: boolean
  reset: number
  remaining?: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) {
    return checkMemoryRateLimit(key, limit, windowMs)
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: false,
    prefix: '@mirai/ratelimit',
  })

  const result = await ratelimit.limit(key)
  return {
    success: result.success,
    reset: result.reset,
    remaining: result.remaining,
  }
}
