'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'
import type { Database } from '@/lib/database.types'

type Bill = Database['public']['Tables']['bills']['Row']

function Icon({ name, className = '' }: { name: 'home' | 'groups' | 'user' | 'logout' | 'plus' | 'arrow'; className?: string }) {
  const shared = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true }
  if (name === 'home') return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>
  if (name === 'groups') return <svg {...shared}><rect x="3" y="4" width="18" height="15" rx="2" /><path d="M7 21h10M9 4V2h6v2" /></svg>
  if (name === 'user') return <svg {...shared}><circle cx="12" cy="7" r="4" /><path d="M4 21c.8-4.1 3.4-6 8-6s7.2 1.9 8 6" /></svg>
  if (name === 'logout') return <svg {...shared}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M7 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
  if (name === 'plus') return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>
  return <svg {...shared}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        setUserName(user.email?.split('@')[0] || 'User')

        // Load bills the user owns, plus bills they joined as a participant
        // (from any device, since joined participants are linked by user_id).
        const ownedResult = await supabase
          .from('bills')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        const joinedResult = await (supabase as any)
          .from('participants')
          .select('bills(*)')
          .eq('user_id', user.id)

        if (ownedResult.error) {
          setError('Failed to load bills')
          console.error(ownedResult.error)
        } else {
          const ownedBills = (ownedResult.data || []) as Bill[]
          const joinedBills: Bill[] = joinedResult.error
            ? []
            : ((joinedResult.data as any[]) || [])
                .map((row) => row.bills)
                .filter((b): b is Bill => Boolean(b))

          if (joinedResult.error) console.error(joinedResult.error)

          const byId = new Map<string, Bill>()
          for (const b of ownedBills) byId.set(b.id, b)
          for (const b of joinedBills) if (!byId.has(b.id)) byId.set(b.id, b)

          setBills(
            Array.from(byId.values()).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          )
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
    router.push('/login')
    router.refresh()
  }

  const joinBill = (event: React.FormEvent) => {
    event.preventDefault()
    const code = joinCode.trim()
    if (code) router.push(`/join/${code}`)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Loading your workspace...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/dashboard" className="dashboard-brand"><span>SabaiB</span><span className="brand-penguin">🐧</span></Link>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link href="/dashboard" className="dashboard-nav-link active"><Icon name="home" /> <span>Home</span></Link>
          <Link href="/groups" className="dashboard-nav-link"><Icon name="groups" /> <span>Groups</span></Link>
          <button type="button" className="dashboard-nav-link" onClick={handleLogout}><Icon name="user" /> <span>Profile</span></button>
        </nav>
        <button className="dashboard-logout" onClick={handleLogout}><Icon name="logout" /> Log out</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topline"><p>Home</p><span className="dashboard-user">{userName}</span></header>
        {error && <div className="mb-6"><Alert type="error" message={error} /></div>}
        <section className="welcome-banner">
          <div><p className="eyebrow">WELCOME BACK</p><h1>Hi, {userName || 'there'} <span>👋</span></h1><p className="welcome-copy">You have {bills.length} active {bills.length === 1 ? 'bill' : 'bills'} ready to split.</p></div>
          <div className="welcome-actions"><Link href="/bills/new" className="create-bill-button"><Icon name="plus" /> Create bill</Link><button type="button" className="join-button" onClick={() => setJoinOpen(true)}>Join a bill</button></div>
        </section>
        <section id="active-bills" className="bills-section">
          <div className="section-heading"><h2>Active groups</h2>{bills.length > 2 && <a href="#active-bills">See all <Icon name="arrow" /></a>}</div>
          {bills.length === 0 ? (
            <div className="empty-bills"><div className="empty-icon">⌁</div><h3>No active bills yet</h3><p>Create a bill for your group or join one with an invite code.</p><div><Link href="/bills/new" className="create-bill-button">Create bill</Link><button type="button" onClick={() => setJoinOpen(true)} className="text-join-button">Join a bill</button></div></div>
          ) : (
            <div className="bill-grid">{bills.map((bill) => <article key={bill.id} className="bill-card"><div className="bill-card-heading"><div><h3>{bill.restaurant_name || 'Untitled bill'}</h3><p>Code {bill.code || '—'}</p></div><span className={bill.settled_at ? 'status-pill settled' : 'status-pill'}>{bill.settled_at ? 'Settled' : 'Active'}</span></div><p className="bill-total">{formatMoney(bill.total_amount, bill.currency)} <small>total</small></p><Link href={`/bills/${bill.id}`} className="open-bill-button">Open</Link></article>)}</div>
          )}
        </section>
      </main>
      {joinOpen && <div className="join-modal-backdrop" role="presentation" onMouseDown={() => setJoinOpen(false)}><div className="join-modal" role="dialog" aria-modal="true" aria-labelledby="join-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setJoinOpen(false)} aria-label="Close">×</button><p className="eyebrow">JOIN A BILL</p><h2 id="join-title">Have an invite code?</h2><p>Enter the code your friend shared to join their bill.</p><form onSubmit={joinBill}><label htmlFor="join-code">Bill code</label><input id="join-code" autoFocus placeholder="e.g. B7X2KP" value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} /><button className="create-bill-button" type="submit">Join bill <Icon name="arrow" /></button></form></div></div>}
    </div>
  )
}
