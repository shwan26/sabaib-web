'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'

export default function ConfirmClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        const tokenHash = searchParams.get('token_hash')
        const verificationType = searchParams.get('type')
        const code = searchParams.get('code')
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (!tokenHash && !code && !(accessToken && refreshToken)) {
          setError('No confirmation code found in URL')
          setLoading(false)
          return
        }

        const { data, error } = tokenHash
          ? await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: verificationType === 'recovery' ? 'recovery' : 'email',
            })
          : code
            ? await supabase.auth.exchangeCodeForSession(code)
            : await supabase.auth.setSession({
                access_token: accessToken!,
                refresh_token: refreshToken!,
              })

        if (error) {
          setError(error.message)
        } else {
          setEmail(data.user?.email ?? data.session?.user?.email ?? '')
          setSuccess(true)
          const redirectParam = searchParams.get('next') || searchParams.get('redirect')
          const redirectTo =
            redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
              ? redirectParam
              : verificationType === 'recovery' ? '/update-password' : '/dashboard'
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push(redirectTo)
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
          message={
            email
              ? `Confirmed ${email}. Redirecting...`
              : 'Your account has been successfully verified. Redirecting...'
          }
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
            href="/signup"
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