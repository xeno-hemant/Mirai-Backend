import 'server-only'

import { inngest } from './client'
import { sendEmail } from './emailService'
import {
  waitlistConfirmationTemplate,
  hackathonRegistrationTemplate,
  matchCreatedTemplate,
} from './emails/templates'
import { createAdminClient } from '@/src/lib/supabase/admin'

export interface WaitlistJoinedEvent {
  name: 'waitlist/joined'
  data: {
    waitlistId: string
    email: string
    role?: string | null
  }
}

export interface HackathonRegisteredEvent {
  name: 'hackathon/registered'
  data: {
    hackathonTitle: string
    userEmail: string
    userName: string
    registrationId: string
  }
}

export interface MatchCreatedEvent {
  name: 'match/created'
  data: {
    matchId: string
    userAId: string
    userBId: string
  }
}

export const waitlistJoinedFunction = inngest.createFunction(
  {
    id: 'send-waitlist-confirmation-email',
    retries: 3,
    triggers: [{ event: 'waitlist/joined' }],
  },
  async ({ event, step }: { event: WaitlistJoinedEvent; step: any }) => {
    const { email, role, waitlistId } = event.data

    await step.run('send-confirmation-email', async () => {
      const template = waitlistConfirmationTemplate({ email, role })
      return await sendEmail({
        to: email,
        content: template,
        idempotencyKey: `waitlist_${waitlistId}`,
      })
    })
  }
)

export const hackathonRegisteredFunction = inngest.createFunction(
  {
    id: 'send-hackathon-registration-email',
    retries: 3,
    triggers: [{ event: 'hackathon/registered' }],
  },
  async ({ event, step }: { event: HackathonRegisteredEvent; step: any }) => {
    const { hackathonTitle, userEmail, userName, registrationId } = event.data

    await step.run('send-registration-email', async () => {
      const template = hackathonRegistrationTemplate({ hackathonTitle, userName })
      return await sendEmail({
        to: userEmail,
        content: template,
        idempotencyKey: `hackathon_${registrationId}`,
      })
    })
  }
)

export const matchCreatedFunction = inngest.createFunction(
  {
    id: 'notify-users-match-created',
    retries: 3,
    triggers: [{ event: 'match/created' }],
  },
  async ({ event, step }: { event: MatchCreatedEvent; step: any }) => {
    const { matchId, userAId, userBId } = event.data

    await step.run('fetch-matched-users-and-notify', async () => {
      const adminClient = createAdminClient()

      // Fetch profiles
      const { data: users } = await adminClient
        .from('users')
        .select('id, auth_user_id, full_name')
        .in('id', [userAId, userBId])

      if (!users || users.length < 2) return

      const userA = users.find((u) => u.id === userAId)
      const userB = users.find((u) => u.id === userBId)
      if (!userA || !userB) return

      // Get user emails from auth
      const [authResA, authResB] = await Promise.all([
        adminClient.auth.admin.getUserById(userA.auth_user_id),
        adminClient.auth.admin.getUserById(userB.auth_user_id),
      ])

      const emailA = authResA.data.user?.email
      const emailB = authResB.data.user?.email

      if (emailA) {
        await sendEmail({
          to: emailA,
          content: matchCreatedTemplate({
            userName: userA.full_name,
            matchedWithName: userB.full_name,
          }),
          idempotencyKey: `match_${matchId}_${userA.id}`,
        })
      }

      if (emailB) {
        await sendEmail({
          to: emailB,
          content: matchCreatedTemplate({
            userName: userB.full_name,
            matchedWithName: userA.full_name,
          }),
          idempotencyKey: `match_${matchId}_${userB.id}`,
        })
      }
    })
  }
)

export const inngestFunctions = [
  waitlistJoinedFunction,
  hackathonRegisteredFunction,
  matchCreatedFunction,
]
