'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Alert } from '@/components/Alert'
import {
  generateToken,
  hashToken,
  storeGuestToken,
  storeGuestParticipantId,
  getGuestParticipantId,
} from '@/lib/tokenUtils'
import type { Database } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

type Bill = Database['public']['Tables']['bills']['Row']

export default function JoinBillPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const supabase = createBrowserSupabaseClient()

  const [bill, setBill] = useState<Bill | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [alreadyJoined, setAlreadyJoined] = useState(false)

  useEffect(() => {
    const loadBill = async () => {
      try {
        // Looked up via a rate-limited API route (not directly against
        // Supabase) so guessing/brute-forcing join codes is throttled.
        const lookupResponse = await fetch(`/api/join/${encodeURIComponent(code.trim())}`)

        if (!lookupResponse.ok) {
          if (lookupResponse.status === 429) {
            setError('Too many attempts. Please wait a moment and try again.')
          } else {
            setError('Bill not found. Check your invite code.')
          }
          setLoading(false)
          return
        }

        const { bill: fetchedBill } = (await lookupResponse.json()) as { bill: Bill }
        const data = fetchedBill

        // Check if bill is settled
        if (data.settled_at) {
          setError(
            'This bill has been settled and is no longer accepting new participants.'
          )
          setLoading(false)
          return
        }

        setBill(data)

        // Any device, any account: figure out whether "we" already joined this
        // bill, either as a signed-in account or as a guest on this browser.
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        setUser(currentUser)

        if (currentUser) {
          const existing = await (supabase as any)
            .from('participants')
            .select('id')
            .eq('bill_id', data.id)
            .eq('user_id', currentUser.id)
            .maybeSingle()

          if (existing.data) {
            router.replace(`/bills/${data.id}`)
            return
          }
          setGuestName(currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '')
        } else {
          const guestParticipantId = getGuestParticipantId(data.id)
          if (guestParticipantId) {
            const existing = await (supabase as any)
              .from('participants')
              .select('id')
              .eq('id', guestParticipantId)
              .eq('bill_id', data.id)
              .maybeSingle()

            if (existing.data) {
              setAlreadyJoined(true)
              setLoading(false)
              return
            }
          }
        }
      } catch (err) {
        setError('An error occurred while loading the bill.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadBill()
  }, [code, supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!guestName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!bill) {
      setError('Bill not found')
      return
    }

    setSubmitting(true)

    try {
      if (user) {
        // Signed-in account: link the participant to the account instead of
        // a guest token, so it's reachable from any device.
        const insertResult = await (supabase as any)
          .from('participants')
          .insert([
            {
              bill_id: bill.id,
              user_id: user.id,
              name: guestName,
              role: 'member' as const,
            },
          ])
          .select()
          .single()

        if (insertResult.error) {
          // Unique violation means another tab/device just joined us already.
          if (insertResult.error.code === '23505') {
            router.push(`/bills/${bill.id}`)
            router.refresh()
            return
          }
          setError('Failed to join bill: ' + insertResult.error.message)
          console.error(insertResult.error)
          return
        }
      } else {
        // Guest: identify them with a locally-stored token, same as before,
        // but also remember which participant row is "us" for next time.
        const token = generateToken()
        const tokenHash = await hashToken(token)

        const insertResult = await (supabase as any)
          .from('participants')
          .insert([
            {
              bill_id: bill.id,
              name: guestName,
              role: 'member' as const,
              guest_token_hash: tokenHash,
            },
          ])
          .select()
          .single()

        if (insertResult.error) {
          setError('Failed to join bill: ' + insertResult.error.message)
          console.error(insertResult.error)
          return
        }

        storeGuestToken(bill.id, token)
        storeGuestParticipantId(bill.id, insertResult.data.id)
      }

      router.push(`/bills/${bill.id}`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <Alert type="error" message={error || 'Bill not found'} />
          </div>
        </div>
      </div>
    )
  }

  if (alreadyJoined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re already in</h1>
            <p className="text-gray-600 text-sm mb-6">
              This browser already joined {bill.restaurant_name || 'this bill'}.
            </p>
            <Button className="w-full" onClick={() => router.push(`/bills/${bill.id}`)}>
              Go to Bill
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Join Bill</h1>
            <p className="text-gray-600 text-sm mt-1">
              You've been invited to join a bill
            </p>
          </div>

          {/* Bill Info Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Bill:</p>
            <p className="font-semibold text-gray-900">
              {bill.restaurant_name || 'Unnamed Bill'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Total: <span className="font-semibold">{bill.total_amount}</span>{' '}
              {bill.currency}
            </p>
          </div>

          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
              Joining as <span className="font-semibold">{user.email}</span>. You&apos;ll be able to
              open this bill from any device you&apos;re signed into.
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              containerClassName="mb-6"
            />

            <Button type="submit" isLoading={submitting} className="w-full">
              Join Bill
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            By joining, you can view and manage your portion of this bill.
          </p>

          {!user && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Joining as a guest works on this device only.{' '}
              <Link
                href={`/login?redirect=${encodeURIComponent(`/join/${code}`)}`}
                className="text-blue-600 hover:text-blue-700"
              >
                Log in
              </Link>{' '}
              or{' '}
              <Link
                href={`/signup?redirect=${encodeURIComponent(`/join/${code}`)}`}
                className="text-blue-600 hover:text-blue-700"
              >
                create an account
              </Link>{' '}
              first to join with your account instead.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
