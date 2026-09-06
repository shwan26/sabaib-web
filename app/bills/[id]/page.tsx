'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Alert } from '@/components/Alert'
import type { Database } from '@/lib/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Bill = Database['public']['Tables']['bills']['Row']
type Participant = Database['public']['Tables']['participants']['Row']

export default function BillDetailPage() {
  const router = useRouter()
  const params = useParams()
  const billId = params.id as string
  const supabase = createBrowserSupabaseClient()

  const [bill, setBill] = useState<Bill | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copyNotification, setCopyNotification] = useState(false)
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    const loadBillData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        // Load bill
        const billResult = await (supabase as any)
          .from('bills')
          .select('*')
          .eq('id', billId)
          .single()

        if (billResult.error) {
          setError('Bill not found')
          return
        }

        if (!billResult.data) {
          setError('Bill not found')
          return
        }

        const billData = billResult.data as Bill

        // Check if user is the host
        if (user && billData.owner_id === user.id) {
          setIsHost(true)
        }

        setBill(billData)

        // Load participants
        const participantsResult = await (supabase as any)
          .from('participants')
          .select('*')
          .eq('bill_id', billId)
          .order('joined_at', { ascending: true })

        if (participantsResult.error) {
          console.error(participantsResult.error)
        } else {
          setParticipants((participantsResult.data as Participant[]) || [])
        }
      } catch (err) {
        setError('An error occurred')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadBillData()

    // Set up real-time subscription for participants
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel(`bill-${billId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'participants',
            filter: `bill_id=eq.${billId}`,
          },
          (payload) => {
            // Reload participants on any change
            loadParticipants()
          }
        )
        .subscribe()
    }

    const loadParticipants = async () => {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('bill_id', billId)
        .order('joined_at', { ascending: true })

      if (data) {
        setParticipants(data)
      }
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [billId, supabase])

  const generateInviteLink = (): string => {
    if (bill?.code) {
      return `${window.location.origin}/join/${bill.code}`
    }
    return `${window.location.origin}/join/${billId}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateInviteLink())
      setCopyNotification(true)
      setTimeout(() => setCopyNotification(false), 3000)
    } catch (err) {
      setError('Failed to copy link')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
        <p className="text-gray-600 mt-2">Loading bill details...</p>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert type="error" message={error || 'Bill not found'} />
        <div className="mt-4">
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show settled state
  if (bill.settled_at) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert
          type="info"
          title="Bill Settled"
          message="This bill has been settled and is now closed."
        />
        <div className="mt-4">
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Bill Info Card */}
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {bill.restaurant_name || 'Unnamed Bill'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Created on {new Date(bill.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-blue-600">
              {bill.total_amount}
            </p>
            <p className="text-gray-600">{bill.currency}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Status:{' '}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                bill.settled_at
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {bill.status}
            </span>
          </p>
        </div>

        {/* Share Section (Host Only) */}
        {isHost && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Share Bill with Guests
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={generateInviteLink()}
                readOnly
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
              <Button onClick={copyToClipboard} variant="primary">
                Copy Link
              </Button>
            </div>
            {copyNotification && (
              <p className="text-sm text-green-600 mt-2">Link copied! 📋</p>
            )}
          </div>
        )}
      </Card>

      {/* Participants */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Participants ({participants.length})
        </h2>

        {participants.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-3">No participants yet</p>
              {isHost && (
                <p className="text-sm text-gray-500">
                  Share the bill link above to invite guests
                </p>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {participants.map((participant) => (
              <Card key={participant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {participant.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.role === 'host' ? 'Host' : 'Guest'} •
                        Joined{' '}
                        {new Date(participant.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {participant.is_ready && (
                    <span className="text-green-600 text-sm font-semibold">
                      ✓ Ready
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
