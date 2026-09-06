import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Create a Supabase client for use in Server Components and Route Handlers.
 * Uses cookies to manage the session (set by middleware).
 */
export function createServerSupabaseClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Note: This will be populated by middleware
          if (typeof document === 'undefined') {
            return []
          }
          return document.cookie.split('; ').map((c) => {
            const [key, value] = c.split('=')
            return { name: key, value }
          })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value};${
              options?.maxAge ? `max-age=${options.maxAge};` : ''
            }${options?.path ? `path=${options.path};` : ''}${
              options?.domain ? `domain=${options.domain};` : ''
            }`
          })
        },
      },
    }
  )
}

/**
 * Create a Supabase client for use in the browser (Client Components).
 * Uses cookies managed by middleware for session persistence.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a Supabase client with cookie handling for Route Handlers.
 * Import cookies from 'next/headers' and pass them to this function.
 */
export function createRouteHandlerClient(
  cookieStore: Awaited<ReturnType<typeof import('next/headers').cookies>>
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware handling cookies.
          }
        },
      },
    }
  )
}

/**
 * Create a simple Supabase client (without cookie handling).
 * Use only for testing or one-off queries where session isn't needed.
 */
export function createSimpleSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
