import { NextResponse } from 'next/server'

const emails = new Set<string>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const role = typeof body.role === 'string' ? body.role : 'Builder'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 })
    if (emails.has(email)) return NextResponse.json({ message: 'You are already on the list.' }, { status: 409 })
    emails.add(email)
    return NextResponse.json({ message: `Welcome, ${role.toLowerCase()}. You are on the list.` })
  } catch {
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 400 })
  }
}
