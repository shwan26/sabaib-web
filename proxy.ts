import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function proxy(request: NextRequest) {
  // Supabase's recovery/confirmation emails can produce links with a doubled
  // leading slash (e.g. "//auth/confirm") when the Dashboard's Site URL has a
  // trailing slash. That path doesn't match any route, so collapse it before
  // it 404s instead of relying on the Dashboard config being correct.
  if (/\/{2,}/.test(request.nextUrl.pathname)) {
    const normalizedUrl = new URL(request.url)
    normalizedUrl.pathname = request.nextUrl.pathname.replace(/\/{2,}/g, '/')
    return NextResponse.redirect(normalizedUrl)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with an extension (static assets served from /public, e.g. images, fonts)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
}
