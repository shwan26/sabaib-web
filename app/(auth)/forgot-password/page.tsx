'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function ForgotPasswordPage() {
  const supabase = createBrowserSupabaseClient()
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/confirm?next=/update-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
      } else {
        setSubmittedEmail(email.trim())
        setSubmitted(true)
      }
    } catch (requestError) {
      setError('An error occurred. Please try again.')
      console.error(requestError)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-heading">
          <h2>Check your email</h2>
        </div>

        <Alert
          type="success"
          message={`If an account exists for ${submittedEmail}, we sent a password reset link. Check your inbox and follow the link to choose a new password.`}
        />

        <div className="auth-signup-prompt">
          <p>
            <Link href="/login">Back to login</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-heading">
        <h2>Reset your password</h2>
      </div>

      {error && (
        <div className="auth-error">
          <Alert type="error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

        <Button type="submit" isLoading={loading} className="auth-submit">
          Send reset link
        </Button>
      </form>

      <div className="auth-signup-prompt">
        <p>
          Remember your password? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}