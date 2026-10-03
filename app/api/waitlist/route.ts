import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { waitlistSchema } from '@/src/server/validators/waitlist.validator'
import { joinWaitlist, getWaitlistCount } from '@/src/server/services/waitlist.service'

export async function GET() {
  try {
    const count = await getWaitlistCount()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 1200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = waitlistSchema.safeParse({
      email: body.email,
      role: typeof body.role === 'string' ? body.role.toLowerCase() : 'builder',
      source: 'landing_form',
      website_trap: body.website_trap,
      acceptedTerms: true,
      acceptedPrivacy: true,
    })

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
      return NextResponse.json(
        { message: firstError ?? 'Enter a valid email address.' },
        { status: 400 }
      )
    }

    const headerStore = await headers()
    const clientIp =
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerStore.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = headerStore.get('user-agent') || undefined

    const result = await joinWaitlist(parsed.data, clientIp, userAgent)
    return NextResponse.json({ message: result.message })
  } catch (err: unknown) {
    console.error('Waitlist POST error details:', err)
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    const isRateLimited = message.startsWith('RATE_LIMITED')
    return NextResponse.json(
      { message: isRateLimited ? 'Too many submissions. Please try again later.' : 'Something went wrong. Please try again.' },
      { status: isRateLimited ? 429 : 400 }
    )
  }
}
