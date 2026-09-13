import { NextResponse, type NextRequest } from 'next/server'
import { createSimpleSupabaseClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Escape ilike wildcard characters so a supplied code can't be used as a
// pattern to match more than one bill (e.g. "%").
function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

export async function GET(request: NextRequest, ctx: RouteContext<'/api/join/[code]'>) {
  const { code } = await ctx.params
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const { allowed, retryAfterSeconds } = checkRateLimit(`join:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  })

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  const suppliedCode = code.trim()
  const supabase = createSimpleSupabaseClient()

  let result = await supabase
    .from('bills')
    .select('*')
    .ilike('code', escapeIlike(suppliedCode))
    .maybeSingle()

  if (!result.data && !result.error && UUID_RE.test(suppliedCode)) {
    result = await supabase.from('bills').select('*').eq('id', suppliedCode).maybeSingle()
  }

  if (result.error || !result.data) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
  }

  return NextResponse.json({ bill: result.data })
}
