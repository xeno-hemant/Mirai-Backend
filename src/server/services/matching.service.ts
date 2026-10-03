import 'server-only'

import {
  getCandidateDeck,
  executeSwipe,
  type SwipeDirection,
  type UserRow,
} from '../repositories/matching.repository'
import { getUserById } from './users.service'
import { inngest } from '../jobs/client'

export function calculateCompatibility(userA: UserRow, userB: UserRow): number {
  let score = 50 // Base alignment

  // Skills overlap
  const sharedSkills = userA.skills.filter((s) => userB.skills.includes(s))
  score += Math.min(25, sharedSkills.length * 8)

  // Interests overlap
  const sharedInterests = userA.interests.filter((i) => userB.interests.includes(i))
  score += Math.min(15, sharedInterests.length * 5)

  // Commitment level match
  if (userA.commitment_level === userB.commitment_level) {
    score += 10
  }

  // Location / Remote match
  if (userA.open_to_remote && userB.open_to_remote) {
    score += 5
  }

  return Math.min(99, Math.max(60, score))
}

export async function fetchCandidateDeck(currentUserId: string, cursor?: string, limit?: number) {
  const currentUser = await getUserById(currentUserId)
  const { items, nextCursor } = await getCandidateDeck({ userId: currentUserId, cursor, limit })

  if (!currentUser) {
    return { items: [], nextCursor: null }
  }

  // Compute compatibility score for each candidate
  const enrichedCandidates = items.map((candidate) => ({
    ...candidate,
    matchPercentage: calculateCompatibility(currentUser, candidate),
  }))

  return {
    items: enrichedCandidates,
    nextCursor,
  }
}

export async function processSwipe(
  swiperId: string,
  targetId: string,
  direction: SwipeDirection
) {
  const [swiper, target] = await Promise.all([
    getUserById(swiperId),
    getUserById(targetId),
  ])

  if (!swiper || !target) {
    throw new Error('User not found')
  }

  const score = calculateCompatibility(swiper, target)
  const result = await executeSwipe({
    swiperId,
    targetId,
    direction,
    compatibilityScore: score,
  })

  // If mutual match occurred, trigger async notification workflow
  if (result.isMatch && result.matchId) {
    try {
      await inngest.send({
        name: 'match/created',
        data: {
          matchId: result.matchId,
          userAId: swiperId < targetId ? swiperId : targetId,
          userBId: swiperId < targetId ? targetId : swiperId,
        },
      })
    } catch (err) {
      console.error('Failed to trigger match Inngest event (graceful fallback):', err)
    }
  }

  return result
}
