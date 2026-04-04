'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Sparkles, Mail, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

const RESEND_COOLDOWN = 60 // seconds

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendError, setResendError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function handleResend() {
    if (resendCooldown > 0 || !email) return
    setResendError('')
    setResendSuccess(false)

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      setResendSuccess(true)
      setResendCooldown(RESEND_COOLDOWN)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend email'
      setResendError(message)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
        <Mail className="h-6 w-6 text-indigo-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
      <p className="text-gray-600 mb-6">
        We sent a verification link to{' '}
        {email ? <strong>{email}</strong> : 'your email'}. Click the link to
        activate your account.
      </p>

      {resendError && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {resendError}
        </div>
      )}

      {resendSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          Verification email resent. Check your inbox.
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={resendCooldown > 0 || !email}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        {resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : 'Resend verification email'}
      </button>

      <Link
        href="/login"
        className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
      >
        Back to login
      </Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">AI Talent Academy</span>
          </Link>
        </div>

        <Suspense>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
