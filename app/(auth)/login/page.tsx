'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Alert } from '@/components/Alert'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-heading">
        <h2>Log into your account</h2>
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
          onChange={(e) => setEmail(e.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

        <Button type="submit" isLoading={loading} className="auth-submit">
          Login
        </Button>
      </form>

      <div className="auth-signup-prompt">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup">Create account</Link>
        </p>
      </div>
    </div>
  )
}
