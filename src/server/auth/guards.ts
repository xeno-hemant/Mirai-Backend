import 'server-only'

import { getSessionUser, type SessionContext, type UserProfile } from './session'
import { createAdminClient } from '@/src/lib/supabase/admin'

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden: Insufficient privileges') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Requires verified authentication.
 * Guarantees authUser is present and application profile exists and is active.
 */
export async function requireUser(): Promise<{ authUser: SessionContext['authUser']; profile: UserProfile }> {
  const session = await getSessionUser()
  if (!session || !session.authUser) {
    throw new UnauthorizedError('You must be logged in to perform this action.')
  }

  if (!session.profile) {
    throw new ForbiddenError('User profile not initialized or account deactivated.')
  }

  return {
    authUser: session.authUser,
    profile: session.profile,
  }
}

/**
 * Requires a specific role ('founder' | 'builder' | 'student').
 * Rejects any unlisted role.
 */
export async function requireRole(allowedRoles: Array<'founder' | 'builder' | 'student'>): Promise<{
  authUser: SessionContext['authUser']
  profile: UserProfile
}> {
  const context = await requireUser()
  if (!allowedRoles.includes(context.profile.role)) {
    throw new ForbiddenError(`Action restricted to roles: ${allowedRoles.join(', ')}`)
  }
  return context
}

/**
 * Requires platform administrator privileges verified via admin_users lookup.
 */
export async function requireAdmin(): Promise<{ authUser: SessionContext['authUser']; profile: UserProfile }> {
  const context = await requireUser()
  const adminClient = createAdminClient()
  
  const { data: adminRecord } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', context.authUser.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!adminRecord) {
    throw new ForbiddenError('Administrator credentials required.')
  }

  return context
}
