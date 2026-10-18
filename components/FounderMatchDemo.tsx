'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Heart, X, RotateCcw, Sparkles, Check, ArrowRight } from 'lucide-react'

export interface Candidate {
  id: string
  initial: string
  initialBg: string
  initialColor: string
  name: string
  role: string
  score: string
  tags: string[]
  bio: string
}

const SAMPLE_PROFILES: Candidate[] = [
  {
    id: 'jayant',
    initial: 'J',
    initialBg: 'bg-[#0074db]/10',
    initialColor: 'text-[#0074db]',
    name: 'Jayant Sharma',
    role: 'AI Systems + Rust',
    score: '89% match',
    tags: ['LLMs', 'Distributed', 'Full-time'],
    bio: 'Building an autonomous agent runtime with local model orchestration.',
  },
  {
    id: 'sana',
    initial: 'S',
    initialBg: 'bg-emerald-500/10',
    initialColor: 'text-emerald-600',
    name: 'Sana Mehta',
    role: 'Product + Community',
    score: '92% match',
    tags: ['Product thinking', 'Climate', 'Remote'],
    bio: 'Designing coordination software to help community solar microgrids share power.',
  },
  {
    id: 'maya',
    initial: 'M',
    initialBg: 'bg-indigo-500/10',
    initialColor: 'text-indigo-600',
    name: 'Maya Chen',
    role: 'Full-stack + Design',
    score: '95% match',
    tags: ['Next.js', 'Fintech', 'Hybrid'],
    bio: 'Obsessed with micro-interactions and zero-friction developer checkout experiences.',
  },
  {
    id: 'alex',
    initial: 'A',
    initialBg: 'bg-sky-500/10',
    initialColor: 'text-sky-600',
    name: 'Alex Rivera',
    role: 'Distributed Systems',
    score: '88% match',
    tags: ['Go', 'Kubernetes', 'Open Source'],
    bio: 'Architecting peer-to-peer compute infrastructure for collaborative tools.',
  },
  {
    id: 'tara',
    initial: 'T',
    initialBg: 'bg-amber-500/10',
    initialColor: 'text-amber-600',
    name: 'Tara Roy',
    role: 'Hardware + IoT',
    score: '91% match',
    tags: ['Robotics', 'Embedded C', 'Hardware'],
    bio: 'Prototyping low-cost autonomous sensing nodes for agricultural monitoring.',
  },
]

export default function FounderMatchDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notification, setNotification] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = useState('Showing sample match preview')

  const cardRef = useRef<HTMLDivElement>(null)
  const connectButtonRef = useRef<HTMLButtonElement>(null)

  const isExhausted = currentIndex >= SAMPLE_PROFILES.length
  const currentProfile = !isExhausted ? SAMPLE_PROFILES[currentIndex] : null
  const nextProfile = currentIndex + 1 < SAMPLE_PROFILES.length ? SAMPLE_PROFILES[currentIndex + 1] : null

  // Support ArrowLeft (Pass) and ArrowRight (Connect) for accessibility
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isExhausted || isAnimating) return
      // Only handle if card area or its children are focused or if user isn't typing in an input
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePass()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleConnect()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isExhausted, isAnimating])

  function handlePass() {
    if (isAnimating || isExhausted) return
    setIsAnimating(true)
    setNotification(null)

    const nextIdx = currentIndex + 1
    const nextName = nextIdx < SAMPLE_PROFILES.length ? SAMPLE_PROFILES[nextIdx].name : 'End of preview'
    setLiveAnnouncement(`Passed profile. Next profile: ${nextName}`)

    setTimeout(() => {
      setCurrentIndex(nextIdx)
      setIsAnimating(false)
    }, 240)
  }

  function handleConnect() {
    if (isAnimating || isExhausted || !currentProfile) return
    setIsAnimating(true)

    const note = `Demo only — on launch, this would send ${currentProfile.name} a connection request. Join the waitlist to get early access.`
    setNotification(note)
    setLiveAnnouncement(note)

    // Briefly show the feedback, then transition smoothly to the next profile
    setTimeout(() => {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      setNotification(null)
      setIsAnimating(false)
    }, 1800)
  }

  function handleReplay() {
    setCurrentIndex(0)
    setNotification(null)
    setLiveAnnouncement('Replaying sample profile matches')
  }

  return (
    <div className="w-full max-w-md mx-auto" ref={cardRef}>
      {/* Accessibility announcer */}
      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>

      {/* Demo header badge */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500 font-medium">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600">
          <Sparkles className="w-3 h-3 text-[#0074db]" />
          Sample profiles · preview
        </span>
        {!isExhausted && (
          <span className="text-slate-400">
            {currentIndex + 1} of {SAMPLE_PROFILES.length}
          </span>
        )}
      </div>

      {/* Card stack container */}
      <div className="relative min-h-[380px] w-full flex items-center justify-center">
        {isExhausted ? (
          /* Exhausted / Completion Card */
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm flex flex-col items-center justify-center min-h-[360px] animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#0074db]/10 text-[#0074db] flex items-center justify-center mb-4">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900">That&apos;s the preview!</h4>
            <p className="mt-2 text-sm text-slate-600 max-w-xs leading-relaxed">
              When Mirai launches, our matching algorithm introduces you to founders and builders with aligned ambition, skills, and working rhythm.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={handleReplay}
                className="w-full sm:w-auto flex-1 h-11 px-4 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Replay preview
              </button>
              <a
                href="#waitlist"
                className="w-full sm:w-auto flex-1 h-11 px-4 rounded-full bg-[#0074db] hover:bg-[#0063bd] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                Join waitlist
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            {/* Background card peek (depth effect) */}
            {nextProfile && (
              <div
                className="absolute inset-x-2 top-3 -bottom-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-6 pointer-events-none transition-transform duration-300"
                style={{ transform: 'scale(0.96) translateY(6px)' }}
                aria-hidden="true"
              >
                <div className="flex items-center gap-3.5 opacity-40">
                  <div className={`w-12 h-12 rounded-xl ${nextProfile.initialBg} ${nextProfile.initialColor} flex items-center justify-center font-bold text-lg`}>
                    {nextProfile.initial}
                  </div>
                  <div>
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded mt-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Active Foreground Card */}
            <div
              className={`relative z-10 w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 ${
                isAnimating ? 'opacity-80 scale-[0.98]' : 'opacity-100 scale-100'
              }`}
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl ${currentProfile!.initialBg} ${currentProfile!.initialColor} flex items-center justify-center font-bold text-lg shadow-xs`}
                  >
                    {currentProfile!.initial}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">
                      {currentProfile!.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {currentProfile!.role}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0074db]/10 text-[#0074db]">
                  {currentProfile!.score}
                </span>
              </div>

              {/* Bio / What they are building */}
              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[40px]">
                {currentProfile!.bio}
              </p>

              {/* Skill chips */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {currentProfile!.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Demo notification alert */}
              {notification && (
                <div
                  className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed animate-fade-in"
                  role="status"
                >
                  <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0074db]" />
                    Connection requested
                  </p>
                  <p className="mt-1 text-slate-600">{notification}</p>
                </div>
              )}

              {/* Interaction buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePass}
                  disabled={isAnimating}
                  aria-label={`Pass on ${currentProfile!.name} (or press left arrow)`}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  ref={connectButtonRef}
                  onClick={handleConnect}
                  disabled={isAnimating}
                  aria-label={`Connect with ${currentProfile!.name} (or press right arrow)`}
                  className="flex-1 h-11 rounded-full bg-[#2773ff] hover:bg-[#1b62e8] active:bg-[#1251c8] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(39,115,255,0.35)] cursor-pointer disabled:opacity-50"
                >
                  <Heart className="w-4 h-4 fill-white/20 stroke-white" />
                  <span>Connect</span>
                </button>
              </div>

              <div className="mt-2 text-center">
                <span className="text-[11px] text-slate-400">
                  Tip: Use <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-sans text-[10px] border border-slate-200">←</kbd> to pass or <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-sans text-[10px] border border-slate-200">→</kbd> to connect
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
