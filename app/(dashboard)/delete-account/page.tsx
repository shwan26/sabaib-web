'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

function Icon({ name, className = '' }: { name: 'home' | 'groups' | 'user' | 'logout'; className?: string }) {
  const shared = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true }
  if (name === 'home') return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>
  if (name === 'groups') return <svg {...shared}><rect x="3" y="4" width="18" height="15" rx="2" /><path d="M7 21h10M9 4V2h6v2" /></svg>
  if (name === 'user') return <svg {...shared}><circle cx="12" cy="7" r="4" /><path d="M4 21c.8-4.1 3.4-6 8-6s7.2 1.9 8 6" /></svg>
  return <svg {...shared}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M7 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
}

export default function DeleteAccountPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [loadingUser, setLoadingUser] = useState(true)
  const [email, setEmail] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setEmail(user.email ?? '')
      setLoadingUser(false)
    }

    loadUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const canDelete = confirmation.trim().toLowerCase() === email.toLowerCase() && !deleting

  const handleDelete = async () => {
    if (!canDelete) return

    setDeleting(true)
    setError('')
    try {
      const response = await fetch('/api/account', { method: 'DELETE' })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'Could not delete your account.')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Could not delete your account. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loadingUser) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/dashboard" className="dashboard-brand"><span>SabaiB</span><span className="brand-penguin">🐧</span></Link>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link href="/dashboard" className="dashboard-nav-link"><Icon name="home" /> <span>Home</span></Link>
          <Link href="/groups" className="dashboard-nav-link"><Icon name="groups" /> <span>Groups</span></Link>
          <Link href="/delete-account" className="dashboard-nav-link active" aria-current="page"><Icon name="user" /> <span>Delete account</span></Link>
        </nav>
        <button className="dashboard-logout" onClick={handleLogout}><Icon name="logout" /> Log out</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topline"><p>Delete account</p><span className="dashboard-user">{email}</span></header>

        <div className="max-w-lg bg-white rounded-lg shadow-md p-8">
          <Alert
            type="warning"
            title="This can't be undone"
            message="Deleting your account permanently removes your login, every bill you own, and your participation in bills you joined. People you shared join codes with will lose access to bills you own."
          />

          <div className="mt-6">
            <p className="text-sm text-sabai-charcoal">
              Signed in as <strong>{email}</strong>. To confirm, type your email address below.
            </p>

            <Input
              label="Confirm your email"
              type="email"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={email}
              autoComplete="off"
              containerClassName="mt-4"
            />

            {error && (
              <div className="mt-4">
                <Alert type="error" message={error} />
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <Button
                type="button"
                variant="primary"
                className="bg-sabai-error hover:bg-sabai-error text-white"
                disabled={!canDelete}
                isLoading={deleting}
                onClick={handleDelete}
              >
                Permanently delete account
              </Button>
              <Link href="/dashboard" className="text-sm font-semibold text-sabai-navy hover:text-sabai-yellow-dark">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
