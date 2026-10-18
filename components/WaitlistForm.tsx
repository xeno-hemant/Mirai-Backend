'use client'

import React, { FormEvent, useState, useId } from 'react'
import Link from 'next/link'
import { Check, Loader2, ArrowRight } from 'lucide-react'

interface WaitlistFormProps {
  idPrefix?: string
  compact?: boolean
  className?: string
}

type RoleType = 'Founder' | 'Builder' | 'Student'

export default function WaitlistForm({ idPrefix = 'hero', compact = false, className = '' }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<RoleType>('Founder')
  const [websiteTrap, setWebsiteTrap] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successData, setSuccessData] = useState<{ email: string; message: string }>({ email: '', message: '' })

  const emailInputId = `${idPrefix}-email`
  const errorId = `${idPrefix}-error`

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Validate email format
    const trimmed = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          role: role.toLowerCase(),
          website_trap: websiteTrap,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setSuccessData({
          email: data.email || trimmed,
          message: data.message || "We've added you to the private beta list.",
        })
      } else {
        setStatus('error')
        setErrorMessage(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        className={`w-full rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950 transition-all ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-emerald-950">You&apos;re on the list!</h3>
            <p className="mt-1 text-sm text-emerald-800/90 leading-relaxed">
              {successData.message} We sent a confirmation note to{' '}
              <span className="font-medium text-emerald-950 underline decoration-emerald-400">{successData.email}</span>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`w-full space-y-3 ${className}`}>
      {/* Honeypot field for bot protection */}
      <input
        type="text"
        name="website_trap"
        value={websiteTrap}
        onChange={(e) => setWebsiteTrap(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* Role Segmented Control */}
      {!compact && (
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 w-fit">
          <span className="sr-only">Select your primary role:</span>
          {(['Founder', 'Builder', 'Student'] as RoleType[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                role === r
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-pressed={role === r}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Form Input Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <label htmlFor={emailInputId} className="sr-only">
            Email address
          </label>
          <input
            id={emailInputId}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder="Enter your email address"
            required
            aria-required="true"
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? errorId : undefined}
            disabled={status === 'loading'}
            className="w-full h-12 px-4 rounded-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2773ff]/25 focus:border-[#2773ff] transition-all disabled:opacity-60 shadow-xs"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-12 px-7 rounded-full bg-[#2773ff] hover:bg-[#1b62e8] active:bg-[#1251c8] text-white text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(39,115,255,0.35)] hover:shadow-[0_6px_20px_0_rgba(39,115,255,0.45)] flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Join waitlist</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Error feedback */}
      {status === 'error' && (
        <p id={errorId} role="alert" className="text-xs font-medium text-rose-600 px-3">
          {errorMessage}
        </p>
      )}

      {/* Terms & Privacy consent */}
      <p className="text-[12px] text-slate-500 px-2 leading-relaxed">
        By joining, you agree to our{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-slate-800 transition-colors">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-slate-800 transition-colors">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}
