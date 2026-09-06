'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Alert } from '@/components/Alert'
import type { Database } from '@/lib/database.types'

type Bill = Database['public']['Tables']['bills']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/auth/login')
          return
        }

        setUserName(user.email?.split('@')[0] || 'User')

        // Load user's bills
        const { data, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (billsError) {
          setError('Failed to load bills')
          console.error(billsError)
        } else {
          setBills(data || [])
        }
      } catch (err) {
        setError('An error occurred')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
        <p className="text-gray-600 mt-2">Loading your bills...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-600 mt-1">Manage and share your bills</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Create Bill Button */}
      <div className="mb-8">
        <Link href="/bills/new">
          <Button className="w-full sm:w-auto">+ Create New Bill</Button>
        </Link>
      </div>

      {/* Bills List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Bills</h2>

        {bills.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You haven't created any bills yet
              </p>
              <Link href="/bills/new">
                <Button variant="primary">Create Your First Bill</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill) => (
              <Link key={bill.id} href={`/bills/${bill.id}`}>
                <Card className="h-full">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {bill.restaurant_name || 'Unnamed Bill'}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 text-sm">
                      Total:{' '}
                      <span className="font-semibold">
                        {bill.total_amount} {bill.currency}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Status:{' '}
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          bill.settled_at
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {bill.settled_at ? 'Settled' : bill.status}
                      </span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Created{' '}
                    {new Date(bill.created_at).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
