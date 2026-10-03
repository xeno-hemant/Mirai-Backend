import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getServerEnv } from '@/src/config/env'
import type { Database } from '@/src/types/database'

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  if (adminClient) return adminClient

  const env = getServerEnv()
  adminClient = createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  return adminClient
}
