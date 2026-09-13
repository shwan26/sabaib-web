'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Alert } from '@/components/Alert'

// Only follow the redirect param back into the app, never off-site.
function safeRedirect(target: string | null): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target
  return '/dashboard'
}

function SignupForm() {
  const supabase = createBrowserSupabaseClient()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirect'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/confirm?redirect=${encodeURIComponent(redirectTo)}`
              : undefined,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600">
            We sent a confirmation link to{' '}
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <Alert
          type="info"
          message="Click the link in your email to confirm your account. You'll be redirected to your dashboard."
        />

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">
            Didn&apos;t receive the email?
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSubmitted(false)
              setName('')
              setEmail('')
              setPassword('')
            }}
          >
            Try Another Email
          </Button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-heading">
        <h2>Create your account</h2>
      </div>

      {error && (
        <div className="auth-error">
          <Alert type="error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          label="Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          containerClassName="auth-field"
          className="auth-input"
        />

        <label className="auth-consent">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <span>
            I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>

        <Button
          type="submit"
          isLoading={loading}
          disabled={!agreedToTerms}
          className="auth-submit"
        >
          Create
        </Button>
      </form>

      <div className="auth-signup-prompt">
        <p>
          Already have an account?{' '}
          <Link
            href={
              redirectTo !== '/dashboard'
                ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                : '/login'
            }
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

function SignupFallback() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-heading">
        <h2>Create your account</h2>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  )
}
