'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Alert } from '@/components/Alert'
import { generateToken, hashToken, storeGuestToken } from '@/lib/tokenUtils'
import type { Database } from '@/lib/database.types'

type Bill = Database['public']['Tables']['bills']['Row']
type ParticipantInsert = Database['public']['Tables']['participants']['Insert']

export default function JoinBillPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const supabase = createBrowserSupabaseClient()

  const [bill, setBill] = useState<Bill | null>(null)
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBill = async () => {
      try {
        // Try to load bill by code first, then by ID
        const selectResult = await (supabase as any)
          .from('bills')
          .select('*')
          .or(`code.eq.${code},id.eq.${code}`)
          .single()

        if (selectResult.error || !selectResult.data) {
          setError('Bill not found. Check your invite code.')
          setLoading(false)
          return
        }

        const data = selectResult.data as Bill

        // Check if bill is settled
        if (data.settled_at) {
          setError(
            'This bill has been settled and is no longer accepting new participants.'
          )
          setLoading(false)
          return
        }

        setBill(data)
      } catch (err) {
        setError('An error occurred while loading the bill.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadBill()
  }, [code, supabase])

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
      // Generate and hash token
      const token = generateToken()
      const tokenHash = await hashToken(token)

      // Insert participant
      const participantData = {
        bill_id: bill.id,
        name: guestName,
        role: 'member' as const,
        guest_token_hash: tokenHash,
      }

      const insertResult = await (supabase as any)
        .from('participants')
        .insert([participantData as any])

      if (insertResult.error) {
        setError('Failed to join bill: ' + insertResult.error.message)
        console.error(insertResult.error)
      } else {
        // Store token in localStorage
        storeGuestToken(bill.id, token)

        // Redirect to bill detail
        router.push(`/bills/${bill.id}`)
        router.refresh()
      }
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
        </div>
      </div>
    </div>
  )
}
