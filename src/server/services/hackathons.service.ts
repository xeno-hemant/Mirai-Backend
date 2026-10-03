import 'server-only'

import {
  listHackathons,
  getHackathonBySlug,
  registerUserForHackathon,
  createHackathonTeam,
  getLeaderboard,
  type HackathonRow,
} from '../repositories/hackathons.repository'
import { sanitizeText } from '../security/sanitize'
import { inngest } from '../jobs/client'
import type { RegisterHackathonInput, CreateTeamInput, ListHackathonsInput } from '../validators/hackathons.validator'

export async function fetchHackathons(query: ListHackathonsInput) {
  return await listHackathons(query)
}

export async function fetchHackathonDetails(slug: string): Promise<HackathonRow | null> {
  return await getHackathonBySlug(slug)
}

export async function registerForEvent(
  userId: string,
  userEmail: string,
  userName: string,
  input: RegisterHackathonInput
) {
  const result = await registerUserForHackathon(input.hackathonId, userId, input.teamId)

  // Dispatch confirmation email if newly registered
  if (result.isNew) {
    try {
      await inngest.send({
        name: 'hackathon/registered',
        data: {
          hackathonTitle: 'Mirai Hackathon',
          userEmail,
          userName,
          registrationId: `${input.hackathonId}_${userId}`,
        },
      })
    } catch (err) {
      console.error('Failed to trigger hackathon Inngest event (graceful fallback):', err)
    }
  }

  return result
}

export async function createTeamForEvent(userId: string, input: CreateTeamInput) {
  return await createHackathonTeam({
    hackathonId: input.hackathonId,
    leadUserId: userId,
    name: sanitizeText(input.name),
    projectTitle: input.projectTitle ? sanitizeText(input.projectTitle) : null,
    projectDescription: input.projectDescription ? sanitizeText(input.projectDescription) : null,
  })
}

export async function fetchLeaderboardForEvent(hackathonId: string, limit = 20) {
  return await getLeaderboard(hackathonId, limit)
}
