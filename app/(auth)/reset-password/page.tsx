'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const resolveRecoverySession = async () => {
      const code = searchParams.get('code')
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          if (active) {
            setError(exchangeError.message)
            setLoading(false)
          }
          return
        }
      }

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          if (active) {
            setError(sessionError.message)
            setLoading(false)
          }
          return
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (!active) return

      if (sessionError) {
        setError(sessionError.message)
      } else if (data.session) {
        setEmail(data.session.user.email ?? '')
        setReady(true)
      } else {
        setError('This password reset link is invalid or has expired.')
      }

      setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event !== 'PASSWORD_RECOVERY') return

      setEmail(session?.user.email ?? '')
      setReady(Boolean(session))
      setError(session ? '' : 'This password reset link is invalid or has expired.')
      setLoading(false)
    })

    void resolveRecoverySession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [searchParams, supabase.auth])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmation) {
      setError('Passwords do not match')
      return
    }

    setUpdating(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
      }
    } catch (updateRequestError) {
      setError('An error occurred. Please try again.')
      console.error(updateRequestError)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-heading">
          <h2>Reset your password</h2>
        </div>
        <p>Verifying your reset link...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-heading">
          <h2>Password updated</h2>
        </div>
        <Alert
          type="success"
          message="Your password has been successfully changed."
        />
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-heading">
          <h2>Reset link unavailable</h2>
        </div>
        <div className="auth-error">
          <Alert
            type="error"
            message={error || 'This password reset link is invalid or has expired.'}
          />
        </div>
        <div className="auth-signup-prompt">
          <p>
            <Link href="/forgot-password">Request a new reset link</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-heading">
        <h2>Choose a new password</h2>
      </div>

      {error && (
        <div className="auth-error">
          <Alert type="error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {email && (
          <Input
            label="Account"
            type="email"
            value={email}
            disabled
            containerClassName="auth-field"
            className="auth-input"
          />
        )}

        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

        <Button type="submit" isLoading={updating} className="auth-submit">
          Change password
        </Button>
      </form>
    </div>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-heading">
        <h2>Reset your password</h2>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}