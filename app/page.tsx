'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function HomePage() {
  const router = useRouter()
  const [billCode, setBillCode] = useState('')
  const [error, setError] = useState('')

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!billCode.trim()) {
      setError('Please enter a bill code')
      return
    }

    router.push(`/join/${billCode}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/penguin_jump.png"
              alt="SabaiB Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold text-yellow-500">SabaiB</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Split the Bill,
            </h2>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Not the Mood!
            </h2>

            <h3 className="text-5xl font-bold text-yellow-500 mb-2">SabaiB</h3>
            <p className="text-gray-600 text-lg mb-12">
              will help you for fair bills.
            </p>

            {/* Just Curious Section */}
            <div className="bg-white rounded-lg p-8 mb-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Just curious?
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Try a live demo bill with sample friends and dishes—no code needed.
              </p>
              <Link href="/signup">
                <Button variant="primary" className="w-full">
                  Try the demo bill →
                </Button>
              </Link>
            </div>

            {/* Have a Bill Code Section */}
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Have a bill code?
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Your host shared a link or a 6-character code. Enter it to join.
              </p>
              <form onSubmit={handleJoinByCode} className="flex gap-2">
                <Input
                  placeholder="e.g. B7X2KP"
                  value={billCode}
                  onChange={(e) => setBillCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button variant="primary" type="submit">
                  Join →
                </Button>
              </form>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
          </div>

          {/* Right Section - Invitation Card */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg max-w-sm w-full border border-green-100">
              <div className="text-center">
                <p className="text-emerald-600 text-sm font-semibold mb-4 tracking-wide">
                  YOU'RE INVITED TO
                </p>

                <div className="mb-8">
                  <p className="text-3xl font-bold text-gray-900">
                    Baan Suan
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    Sathorn
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    BILL CODE
                  </p>
                  <p className="text-2xl font-bold text-gray-900 tracking-wider">
                    B7X2KP
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-8">
                  <span>👥</span>
                  <span className="font-semibold">3 friends joined</span>
                </div>

                <p className="text-sm text-gray-500">
                  Waiting for you
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
