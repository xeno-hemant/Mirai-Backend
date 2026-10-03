'use server'

import { headers } from 'next/headers'
import { createClient } from '@/src/lib/supabase/server'
import { getClientEnv } from '@/src/config/env'
import { LEGAL_CONFIG } from '@/src/config/legal'
import {
  signUpSchema,
  signInSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
  type SignUpInput,
  type SignInInput,
  type PasswordResetRequestInput,
  type PasswordUpdateInput,
} from '@/src/server/validators/auth.validator'
import { rateLimit } from '@/src/server/security/rateLimit'
import { requireUser } from '@/src/server/auth/guards'
import { softDeleteUser, exportUserData } from '@/src/server/services/users.service'
import { success, failure, type Result } from '@/src/types/result'

async function getClientIp(): Promise<string> {
  const headerStore = await headers()
  return (
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export async function signUpAction(rawInput: unknown): Promise<Result<{ userId: string; email: string }>> {
  const parsed = signUpSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid sign-up submission', parsed.error.flatten().fieldErrors)
  }

  const { email, password, fullName, role } = parsed.data
  const ip = await getClientIp()

  // Rate limit: 5 signups per hour per IP
  const rateLimitResult = await rateLimit(`signup:ip:${ip}`, 5, 3600 * 1000)
  if (!rateLimitResult.success) {
    return failure('RATE_LIMITED', 'Too many registration attempts. Please try again later.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        accepted_terms_at: new Date().toISOString(),
        accepted_privacy_at: new Date().toISOString(),
        terms_version: LEGAL_CONFIG.TERMS_VERSION,
        privacy_version: LEGAL_CONFIG.PRIVACY_VERSION,
      },
    },
  })

  if (error || !data.user) {
    return failure('BAD_REQUEST', error?.message ?? 'Registration failed')
  }

  return success({
    userId: data.user.id,
    email: data.user.email ?? email,
  })
}

export async function signInAction(rawInput: unknown): Promise<Result<{ userId: string }>> {
  const parsed = signInSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid credentials provided', parsed.error.flatten().fieldErrors)
  }

  const { email, password } = parsed.data
  const ip = await getClientIp()

  // Rate limit: 10 login attempts per 15 min per IP + email
  const rateLimitResult = await rateLimit(`login:ip:${ip}:${email}`, 10, 15 * 60 * 1000)
  if (!rateLimitResult.success) {
    return failure('RATE_LIMITED', 'Too many login attempts. Please try again in a few minutes.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    // Generic message to prevent email enumeration
    return failure('UNAUTHORIZED', 'Invalid email or password.')
  }

  return success({ userId: data.user.id })
}

export async function signInWithOAuthAction(provider: 'google'): Promise<Result<{ url: string }>> {
  const supabase = await createClient()
  const env = getClientEnv()
  const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  })

  if (error || !data.url) {
    return failure('BAD_REQUEST', error?.message ?? 'OAuth initialization failed')
  }

  return success({ url: data.url })
}

export async function signOutAction(): Promise<Result<{ signedOut: boolean }>> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return success({ signedOut: true })
}

export async function requestPasswordResetAction(rawInput: unknown): Promise<Result<{ message: string }>> {
  const parsed = passwordResetRequestSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid email address', parsed.error.flatten().fieldErrors)
  }

  const { email } = parsed.data
  // Rate limit: 3 password resets per hour per email
  const rateLimitResult = await rateLimit(`pwd-reset:${email}`, 3, 3600 * 1000)
  if (!rateLimitResult.success) {
    return failure('RATE_LIMITED', 'Too many reset requests. Please check your inbox or try again later.')
  }

  const supabase = await createClient()
  const env = getClientEnv()
  // Generic response to prevent account enumeration
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/settings`,
  })

  return success({ message: 'If an account exists for this email, reset instructions have been sent.' })
}

export async function updatePasswordAction(rawInput: unknown): Promise<Result<{ updated: boolean }>> {
  try {
    await requireUser()
  } catch {
    return failure('UNAUTHORIZED', 'Authentication required')
  }

  const parsed = passwordUpdateSchema.safeParse(rawInput)
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'Invalid password', parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return failure('BAD_REQUEST', error.message)
  }

  return success({ updated: true })
}

export async function deleteAccountAction(): Promise<Result<{ deleted: boolean }>> {
  try {
    const { authUser, profile } = await requireUser()
    await softDeleteUser(profile.id, authUser.id)
    const supabase = await createClient()
    await supabase.auth.signOut()
    return success({ deleted: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Deletion failed'
    return failure('INTERNAL_ERROR', message)
  }
}

export async function exportAccountDataAction(): Promise<Result<Record<string, unknown>>> {
  try {
    const { profile } = await requireUser()
    const data = await exportUserData(profile.id)
    return success(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Data export failed'
    return failure('INTERNAL_ERROR', message)
  }
}
