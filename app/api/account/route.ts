import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export async function DELETE(_request: NextRequest) {
  const cookieStore = await (await import('next/headers')).cookies()
  const sessionClient = createRouteHandlerClient(cookieStore)
  const {
    data: { user },
    error: userError,
  } = await sessionClient.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'You must be signed in to delete your account.' }, { status: 401 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    return NextResponse.json({ error: 'Account deletion is not configured on the server.' }, { status: 503 })
  }

  const adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const ownedBillsResult = await adminClient
    .from('bills')
    .select('id')
    .eq('owner_id', user.id)

  if (ownedBillsResult.error) {
    console.error('Failed to find owned bills during account deletion:', ownedBillsResult.error)
    return NextResponse.json({ error: 'Could not prepare your account for deletion.' }, { status: 500 })
  }

  const ownedBillIds = ((ownedBillsResult.data || []) as Array<{ id: string }>).map((bill) => bill.id)

  if (ownedBillIds.length > 0) {
    const deleteBillsResult = await adminClient.from('bills').delete().in('id', ownedBillIds)
    if (deleteBillsResult.error) {
      console.error('Failed to delete owned bills during account deletion:', deleteBillsResult.error)
      return NextResponse.json({ error: 'Could not delete your bills.' }, { status: 500 })
    }
  }

  const deleteParticipantsResult = await adminClient
    .from('participants')
    .delete()
    .eq('user_id', user.id)

  if (deleteParticipantsResult.error) {
    console.error('Failed to delete account participants:', deleteParticipantsResult.error)
    return NextResponse.json({ error: 'Could not delete your bill participation data.' }, { status: 500 })
  }

  const deleteUserResult = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteUserResult.error) {
    console.error('Failed to delete Supabase Auth user:', deleteUserResult.error)
    return NextResponse.json({ error: 'Could not delete your account.' }, { status: 500 })
  }

  await sessionClient.auth.signOut()
  return NextResponse.json({ success: true })
}
