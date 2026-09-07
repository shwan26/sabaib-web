'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'
import type { Database } from '@/lib/database.types'

type Bill = Database['public']['Tables']['bills']['Row']
type Participant = Database['public']['Tables']['participants']['Row']

function Icon({ name, className = '' }: { name: 'home' | 'groups' | 'user' | 'logout'; className?: string }) {
  const shared = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true }
  if (name === 'home') return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>
  if (name === 'groups') return <svg {...shared}><rect x="3" y="4" width="18" height="15" rx="2" /><path d="M7 21h10M9 4V2h6v2" /></svg>
  if (name === 'user') return <svg {...shared}><circle cx="12" cy="7" r="4" /><path d="M4 21c.8-4.1 3.4-6 8-6s7.2 1.9 8 6" /></svg>
  return <svg {...shared}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M7 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function GroupsPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [bills, setBills] = useState<Bill[]>([])
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: ownedBills, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (billsError) throw billsError

        const loadedBills = (ownedBills || []) as Bill[]
        setBills(loadedBills)

        if (loadedBills.length) {
          const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('bill_id')
            .in('bill_id', loadedBills.map((bill) => bill.id))

          if (!participantsError) {
            const counts = (participants || []).reduce<Record<string, number>>((total, participant: Pick<Participant, 'bill_id'>) => {
              total[participant.bill_id] = (total[participant.bill_id] || 0) + 1
              return total
            }, {})
            setParticipantCounts(counts)
          }
        }
      } catch (loadError) {
        console.error(loadError)
        setError('Failed to load your groups. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="dashboard-spinner" /><p>Loading your groups...</p></div>
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/dashboard" className="dashboard-brand"><span>SabaiB</span><span className="brand-penguin">🐧</span></Link>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link href="/dashboard" className="dashboard-nav-link"><Icon name="home" /> <span>Home</span></Link>
          <Link href="/groups" className="dashboard-nav-link active" aria-current="page"><Icon name="groups" /> <span>Groups</span></Link>
          <button type="button" className="dashboard-nav-link" onClick={handleLogout}><Icon name="user" /> <span>Profile</span></button>
        </nav>
        <button className="dashboard-logout" onClick={handleLogout}><Icon name="logout" /> Log out</button>
      </aside>

      <main className="dashboard-main groups-main">
        <header className="groups-header"><h1>Groups</h1><p>All bills you host</p></header>
        {error && <div className="groups-alert"><Alert type="error" message={error} /></div>}

        {bills.length === 0 ? (
          <section className="empty-bills groups-empty">
            <div className="empty-icon">⌁</div>
            <h2>No hosted bills yet</h2>
            <p>When you create a bill, it will appear here for easy access.</p>
            <Link href="/bills/new" className="create-bill-button">Create bill</Link>
          </section>
        ) : (
          <section className="bill-grid groups-grid" aria-label="Hosted bills">
            {bills.map((bill) => {
              const isSettled = Boolean(bill.settled_at) || bill.status === 'completed'
              const people = participantCounts[bill.id] || 0

              return (
                <article key={bill.id} className="bill-card group-bill-card">
                  <div className="bill-card-heading">
                    <div>
                      <h2>{bill.restaurant_name || 'Untitled bill'}</h2>
                      <p>Code {bill.code || '—'} · {people} {people === 1 ? 'person' : 'people'}</p>
                    </div>
                    <span className={isSettled ? 'status-pill settled' : 'status-pill'}>{isSettled ? 'Settled' : 'Active'}</span>
                  </div>
                  <p className="bill-total">{formatMoney(bill.total_amount, bill.currency)} <small>total</small></p>
                  <Link href={`/bills/${bill.id}`} className="open-bill-button">Open</Link>
                </article>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}
