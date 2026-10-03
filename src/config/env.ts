import { z } from 'zod'

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
})

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default('placeholder-service-role-key'),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Mirai <noreply@mirai.build>'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

let validatedServerEnv: ServerEnv | null = null
let validatedClientEnv: ClientEnv | null = null

export function getClientEnv(): ClientEnv {
  if (validatedClientEnv) return validatedClientEnv
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  })
  if (!parsed.success) {
    console.error('Invalid client environment variables:', parsed.error.format())
    throw new Error('Invalid client environment variables')
  }
  validatedClientEnv = parsed.data
  return validatedClientEnv
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv called on the client')
  }
  if (validatedServerEnv) return validatedServerEnv
  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid server environment variables:', parsed.error.format())
    throw new Error('Invalid server environment variables')
  }
  validatedServerEnv = parsed.data
  return validatedServerEnv
}
