import 'server-only'

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database'

export type UserProfile = Database['public']['Tables']['users']['Row']

export interface SessionContext {
  authUser: {
    id: string
    email: string | null
  }
  profile: UserProfile | null
}

/**
 * Derives the authenticated user strictly from Supabase auth.getUser()
 * Never relies on unverified client-supplied tokens or getSession()
 */
export async function getSessionUser(): Promise<SessionContext | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch application profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  return {
    authUser: {
      id: user.id,
      email: user.email ?? null,
    },
    profile,
  }
}
