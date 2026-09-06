import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This refreshes a user's session and returns new tokens if needed
  await supabase.auth.getSession()

  // Protected routes: redirect to login if not authenticated
  const { data } = await supabase.auth.getSession()
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage =
    request.nextUrl.pathname.startsWith('/join') ||
    request.nextUrl.pathname === '/'

  if (!data.session && !isAuthPage && !isPublicPage) {
    // User is not logged in and is trying to access a protected page
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (data.session && isAuthPage) {
    // User is logged in and trying to access auth pages, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
