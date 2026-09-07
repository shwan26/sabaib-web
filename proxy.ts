import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function proxy(request: NextRequest) {
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
