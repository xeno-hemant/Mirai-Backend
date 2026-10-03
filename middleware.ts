import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/src/lib/supabase/middleware'

const PROTECTED_ROUTES = ['/match', '/startups/new', '/dashboard', '/profile', '/settings']

export async function middleware(request: NextRequest) {
  // Update Supabase session cookies
  const response = await updateSession(request)

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected) {
    // Check if session token exists in cookies
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

    if (!hasSession) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('auth', 'required')
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
