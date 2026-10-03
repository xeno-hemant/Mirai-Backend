import { createBrowserClient } from '@supabase/ssr'
import { getClientEnv } from '@/src/config/env'
import type { Database } from '@/src/types/database'

export function createClient() {
  const env = getClientEnv()
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
