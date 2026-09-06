'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Get the code from URL hash or query params
        const code =
          searchParams.get('code') || window.location.hash.substring(1)

        if (!code) {
          setError('No confirmation code found in URL')
          setLoading(false)
          return
        }

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setError(error.message)
        } else {
          setSuccess(true)
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 2000)
        }
      } catch (err) {
        setError('An error occurred during confirmation.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    handleConfirmation()
  }, [searchParams, router, supabase.auth])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600 mb-4"></div>
        <p className="text-gray-600">Confirming your email...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <Alert
          type="success"
          title="Email Confirmed!"
          message="Your account has been successfully verified. Redirecting to your dashboard..."
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <Alert
          type="error"
          title="Confirmation Failed"
          message={error}
        />
        <div className="mt-6 text-center">
          <a
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Try signing up again
          </a>
        </div>
      </div>
    )
  }

  return null
}
