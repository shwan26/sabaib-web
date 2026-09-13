/**
 * In-memory fixed-window rate limiter, keyed by an arbitrary string (e.g. IP).
 *
 * This only limits requests within a single Node process. If this app is
 * deployed across multiple server instances or serverless invocations, swap
 * this for a shared store (e.g. Upstash Redis + @upstash/ratelimit) so limits
 * are enforced across instances instead of per-instance.
 */

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}
