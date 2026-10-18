'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Rocket,
  Users,
  Globe2,
  Zap,
  ChevronDown,
  Menu,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
  Search,
  Check,
} from 'lucide-react'
import WaitlistForm from '@/components/WaitlistForm'
import FounderMatchDemo from '@/components/FounderMatchDemo'

const navLinks = [
  { label: 'Startups', href: '#startups' },
  { label: 'Co-Founders', href: '#cofounders' },
  { label: 'Community', href: '#community' },
  { label: 'Hackathons', href: '#hackathons' },
  { label: 'FAQ', href: '#faq' },
]

const features = [
  {
    icon: Rocket,
    number: '01',
    eyebrow: 'Build in public',
    title: 'Startup profiles',
    copy: 'Turn your early idea into a magnet for the right people, constructive feedback, and initial traction.',
    preview: (
      <div className="w-full max-w-[270px] rounded-xl border border-[#e4e2dc] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2773ff]/10 text-[#2773ff] font-bold text-sm">
            ML
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">OmniLocal</h4>
            <p className="text-[11px] text-slate-500">Autonomous Edge Agents</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            Idea Stage
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          <span className="rounded bg-[#f3f1ec] px-2 py-0.5 text-[10px] font-medium text-slate-700">Rust</span>
          <span className="rounded bg-[#f3f1ec] px-2 py-0.5 text-[10px] font-medium text-slate-700">Local LLM</span>
          <span className="rounded bg-[#f3f1ec] px-2 py-0.5 text-[10px] font-medium text-slate-700">P2P</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Looking for:</span>
          <span className="font-semibold text-[#2773ff]">Co-Founder (Design)</span>
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    number: '02',
    eyebrow: 'Find your people',
    title: 'Co-founder match',
    copy: 'Meet collaborators whose ambition, core technical skills, and working rhythm complement yours.',
    preview: (
      <div className="w-full max-w-[270px] rounded-xl border border-[#e4e2dc] bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
              S
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Sana Mehta</p>
              <p className="text-[10px] text-slate-500">Product + Climate</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2773ff]">
            92% Match
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#2773ff] rounded-full w-[92%]" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">High alignment</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
          <span className="text-slate-500">Full-time ready</span>
          <span className="text-[#2773ff] font-medium flex items-center gap-1">
            <Heart className="w-3 h-3 fill-[#2773ff]/20 stroke-[#2773ff]" /> Direct Match
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: Globe2,
    number: '03',
    eyebrow: 'Stay in the loop',
    title: 'Community feed',
    copy: 'Plug into local builder ecosystems, active discussions, and discussions moving ideas into reality.',
    preview: (
      <div className="w-full max-w-[270px] rounded-xl border border-[#e4e2dc] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-700">Jaipur Builder Chapter</span>
          <span className="ml-auto text-[10px] text-slate-400">2m ago</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          &ldquo;Anyone hacking with local LLMs on low-power devices? Forming a weekend study group.&rdquo;
        </p>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>8 builders joined thread</span>
          <span className="font-medium text-[#2773ff]">Join discussion →</span>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    number: '04',
    eyebrow: 'Make something real',
    title: 'Hackathon hub',
    copy: 'Discover curated virtual hackathons, form sharp teams fast, and ship alongside ambitious peers.',
    preview: (
      <div className="w-full max-w-[270px] rounded-xl border border-[#e4e2dc] bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 text-[10px]">
            Cohort #01
          </span>
          <span className="text-[10px] font-mono text-slate-400">48-Hour Sprint</span>
        </div>
        <h5 className="mt-2 text-xs font-bold text-slate-900">Autonomous Builders Sprint</h5>
        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Squad Formation:</span>
          <span className="font-semibold text-emerald-600">Open for Beta</span>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">3 roles per team</span>
          <span className="font-semibold text-[#2773ff]">Form Squad →</span>
        </div>
      </div>
    ),
  },
]

const faqs = [
  {
    q: 'Who is Mirai for?',
    a: 'Mirai is built specifically for idea-stage founders, builders, designers, and students looking for high-alignment co-founders and early collaborators to build meaningful products together.',
  },
  {
    q: 'Is it free to join the waitlist and use Mirai?',
    a: 'Yes. Joining the waitlist and participating in the core platform during private beta is 100% free.',
  },
  {
    q: 'When does the private beta launch?',
    a: 'We are onboarding builders in rolling cohorts. Join the waitlist with your primary role (Founder, Builder, or Student) to secure early access.',
  },
  {
    q: 'How does the co-founder matching work?',
    a: 'Rather than random networking, Mirai matches builders based on complementary technical skills, commitment level (full-time vs nights & weekends), and shared product interests.',
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0a0f1d] selection:bg-[#dbeafe] selection:text-[#2773ff]">
      {/* ─── STICKY FLOATING PILL NAVBAR (BLUEMYNT STYLE) ─── */}
      <div className="sticky top-4 z-50 px-4 sm:px-6">
        <header className="mx-auto max-w-5xl rounded-full bg-white/92 backdrop-blur-xl border border-black/[0.08] shadow-[0_4px_20px_-2px_rgba(0,14,41,0.05)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
          {/* Mirai dominant logo on left ONLY (by ofbrain removed from header as requested) */}
          <Link href="#top" className="flex items-center focus:outline-none group">
            <div className="relative h-7 w-24 sm:w-28 flex items-center">
              <Image
                src="/mirai-logo-trimmed.png"
                alt="Mirai"
                width={120}
                height={38}
                priority
                className="h-7 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
          </Link>

          {/* Desktop Nav Items in center */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Nav Right CTA Button ONLY */}
          <div className="flex items-center gap-3">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-[#2773ff] hover:bg-[#1b62e8] text-white text-xs font-semibold shadow-[0_2px_10px_0_rgba(39,115,255,0.3)] transition-all cursor-pointer whitespace-nowrap"
            >
              Join waitlist
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="mx-auto mt-2 max-w-5xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href="#waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center h-10 px-4 rounded-full bg-[#2773ff] text-white text-xs font-semibold shadow-xs"
                >
                  Join waitlist
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>

      <main>
        {/* ─── HERO SECTION WITH BLUEMYNT SKY RADIAL GRADIENT ─── */}
        <section id="top" className="relative pt-16 sm:pt-24 pb-16 sm:pb-24 overflow-hidden text-center bg-gradient-to-b from-[#eef5ff] via-[#ffffff] to-[#ffffff]">
          <div className="relative z-10 mx-auto max-w-5xl px-6">
            {/* Asterisk Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200/70 bg-white/80 text-[#2773ff] text-xs font-semibold tracking-wide uppercase mb-6 shadow-xs backdrop-blur-sm">
              <span className="text-sm">✻</span>
              <span>The builder community, reimagined</span>
            </div>

            {/* Large Two-line Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0a0f1d] leading-[1.08] max-w-3xl mx-auto">
              Build the future.<br />
              <span className="text-[#2773ff]">Together.</span>
            </h1>

            {/* One-sentence Subtext */}
            <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A home for bold ideas, curious builders, and the collaborators you haven&apos;t met yet. Find your co-founder, get discovered, and ship.
            </p>

            {/* Waitlist Form Component */}
            <div className="mt-8 max-w-md mx-auto" id="hero-form">
              <WaitlistForm idPrefix="hero" />
            </div>

            {/* ─── REALISTIC PLATFORM PREVIEW CARD (MOCKUP WITH RADIANT GLOW) ─── */}
            <div className="relative mt-14 sm:mt-18">
              <div className="relative z-10 rounded-2xl sm:rounded-3xl border border-[#e4e2dc] bg-white p-3 sm:p-5 shadow-[0_20px_50px_-10px_rgba(39,115,255,0.15)]">
                {/* Mockup Window Header */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#f3f1ec] px-3.5 py-1 text-[11px] font-medium text-slate-600">
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>Search skills, ideas &amp; cohorts...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>342 builders online</span>
                  </div>
                </div>

                {/* Mockup Dashboard Grid */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-left">
                  {/* Card 1 */}
                  <div className="rounded-xl border border-[#e4e2dc] bg-[#f3f1ec] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#2773ff] uppercase tracking-wider">Top Match</span>
                      <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/60">94%</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">Jayant Sharma</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">AI Systems + Rust</p>
                    <div className="mt-3 flex gap-1">
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-[#e4e2dc]">LLMs</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-[#e4e2dc]">Distributed</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-xl border border-[#e4e2dc] bg-[#f3f1ec] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Startup Idea</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Trending</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">Sana Mehta</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Solar Coordination Grid</p>
                    <div className="mt-3 flex gap-1">
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-[#e4e2dc]">Climate</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-[#e4e2dc]">Remote</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-xl border border-[#e4e2dc] bg-[#f3f1ec] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Upcoming Sprint</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">48h</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">Mirai Hackathon #01</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">AI Agent Workflows</p>
                    <div className="mt-3 flex gap-1">
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-[#e4e2dc]">Virtual</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-[#e4e2dc]">Squads</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── FULL-WIDTH ELECTRIC BLUE TRUST BANNER (FROM USER SCREENSHOT 2) ─── */}
            <div className="mt-12 bg-gradient-to-r from-[#377eff] to-[#2563eb] text-white rounded-[28px] p-8 sm:p-10 text-center shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)]">
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-blue-100">
                Join ambitious builders building with Mirai™
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-wider text-white">
                <span className="opacity-95">CO-FOUNDER MATCHING</span>
                <span className="opacity-40">·</span>
                <span className="opacity-95">STARTUP PROFILES</span>
                <span className="opacity-40">·</span>
                <span className="opacity-95">COMMUNITY CHAPTERS</span>
                <span className="opacity-40">·</span>
                <span className="opacity-95">HACKATHON HUBS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── WHY MIRAI SECTION ON SAND (#f3f1ec) ─── */}
        <section className="bg-[#f3f1ec] border-y border-[#e4e2dc] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 md:grid-cols-3 md:items-start">
              <div>
                <div className="bluemynt-eyebrow mb-2">
                  <span>✻</span>
                  <span>Why Mirai</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                  The best things are built <span className="text-[#2773ff]">together.</span>
                </h2>
              </div>
              <p className="text-slate-600 md:col-span-2 text-base sm:text-lg leading-relaxed md:pl-8 font-normal">
                Mirai brings your early-stage journey into one thoughtful space — from the first spark of an idea to the moment you find the people who make it real. No noisy social feeds or awkward cold DMs, just high-intent builders ready to execute.
              </p>
            </div>
          </div>
        </section>

        {/* ─── THE ECOSYSTEM: 4 FEATURE CARDS (ON SAND BG #f3f1ec FROM SCREENSHOT 3) ─── */}
        <section id="startups" className="bg-[#f3f1ec] py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-16">
              <div className="bluemynt-eyebrow justify-center mb-3">
                <span>✻</span>
                <span>The Ecosystem</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Designed for builder momentum.
              </h2>
              <p className="mt-3 text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
                Everything you need to turn idea-stage curiosity into working prototypes and high-velocity teams.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-[#e4e2dc] rounded-[26px] p-2 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Upper Preview Canvas in Sand-Muted */}
                  <div className="bg-[#eae7e1] h-52 sm:h-60 rounded-2xl flex items-center justify-center p-4">
                    {item.preview}
                  </div>

                  {/* Lower Description */}
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-[#2773ff] uppercase tracking-wider">
                        {item.eyebrow}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-mono text-slate-400 font-semibold">{item.number}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {item.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CO-FOUNDER MATCH: 3-CARD SHOWCASE (MATCHING USER SCREENSHOT 1) ─── */}
        <section id="cofounders" className="bg-white py-24 sm:py-36 border-t border-[#e4e2dc]">
          <div className="mx-auto max-w-5xl px-6">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="bluemynt-eyebrow justify-center mb-3">
                <span>✻</span>
                <span>Co-Founder Match</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-[#0a0f1d] tracking-tight leading-tight max-w-2xl mx-auto">
                Your next great co-founder is out there.
              </h2>
              <p className="mt-4 text-slate-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                No awkward networking. Thoughtful matching based on complementary skillsets, commitment level, and shared product vision.
              </p>
            </div>

            {/* 3-Card Architecture from Screenshot 1: Left Sand, Center Electric Blue, Right Sand */}
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
              {/* Card 1: Starter / Complementarity Card (Sand #f3f1ec) */}
              <div className="bg-[#f3f1ec] border border-[#e4e2dc] rounded-[26px] p-7 sm:p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all">
                <div>
                  <h4 className="text-xl font-bold text-[#0a0f1d] mb-1">Skill Match</h4>
                  <p className="text-2xl font-extrabold text-[#0a0f1d] mt-2 mb-4">Complementary</p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2773ff] shrink-0" />
                      <span>Verified engineering &amp; design stacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2773ff] shrink-0" />
                      <span>Direct technical gap fulfillment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2773ff] shrink-0" />
                      <span>Structured portfolio reviews</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#e4e2dc]">
                  <a
                    href="#waitlist"
                    className="w-full h-11 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                  >
                    Find technical match
                  </a>
                </div>
              </div>

              {/* Card 2: Pro Active Card (Electric Blue #538fff from Screenshot 1) */}
              <div className="bg-[#538fff] border border-[#437fe8] rounded-[26px] p-7 sm:p-8 text-white flex flex-col justify-between relative shadow-[0_16px_40px_-8px_rgba(83,143,255,0.45)] hover:-translate-y-1 transition-all">
                <div className="absolute top-5 right-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#2773ff] text-[10px] font-bold">
                    ★ Live Preview
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">Interactive Deck</h4>
                  <p className="text-2xl font-extrabold text-white mt-2 mb-4">Candidate Match</p>
                  <div className="mt-2 text-slate-900">
                    <FounderMatchDemo />
                  </div>
                </div>
              </div>

              {/* Card 3: Commitment & Velocity Card (Sand #f3f1ec) */}
              <div className="bg-[#f3f1ec] border border-[#e4e2dc] rounded-[26px] p-7 sm:p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all">
                <div>
                  <h4 className="text-xl font-bold text-[#0a0f1d] mb-1">Commitment</h4>
                  <p className="text-2xl font-extrabold text-[#0a0f1d] mt-2 mb-4">Aligned Velocity</p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2773ff] shrink-0" />
                      <span>Full-time founders vs nights &amp; weekends</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2773ff] shrink-0" />
                      <span>Direct private intro request flow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2773ff] shrink-0" />
                      <span>Zero cold DMs or random spam</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#e4e2dc]">
                  <a
                    href="#waitlist"
                    className="w-full h-11 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                  >
                    Match on commitment
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── COMMUNITY & HACKATHONS (ON SAND BG #f3f1ec) ─── */}
        <section id="community" className="bg-[#f3f1ec] py-24 sm:py-32 border-t border-[#e4e2dc]">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Community Card */}
              <div className="bg-white border border-[#e4e2dc] rounded-[26px] p-8 sm:p-10 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bluemynt-eyebrow">
                      <span>✻</span>
                      <span>Community</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2773ff]">
                      Cohort 01 Upcoming
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    The room where ideas get louder.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Local builder chapters, async AMAs with experienced founders, and candid build-in-public updates. Designed to keep momentum high between milestones.
                  </p>
                </div>
                <div className="mt-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Launching with private beta</span>
                  <a href="#waitlist" className="font-semibold text-[#2773ff] hover:underline flex items-center gap-1">
                    Reserve spot <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Hackathons Card */}
              <div id="hackathons" className="bg-white border border-[#e4e2dc] rounded-[26px] p-8 sm:p-10 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bluemynt-eyebrow">
                      <span>✻</span>
                      <span>Hackathons</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Virtual Sprints
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    Ship something unexpected.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Form a sharp cross-functional squad over a weekend. Build prototypes, test assumptions, and pitch real working software to early backers.
                  </p>
                </div>
                <div className="mt-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>First seasonal challenge soon</span>
                  <a href="#waitlist" className="font-semibold text-[#2773ff] hover:underline flex items-center gap-1">
                    Join waitlist <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ACCORDION ─── */}
        <section id="faq" className="bg-white border-t border-[#e4e2dc] py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-14">
              <div className="bluemynt-eyebrow justify-center mb-3">
                <span>✻</span>
                <span>FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-[#e4e2dc] bg-[#f3f1ec] transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-900 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#2773ff]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed font-normal animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── CLOSING CTA BAND (ON SAND BG) ─── */}
        <section id="waitlist" className="bg-[#f3f1ec] py-20 sm:py-32 border-t border-[#e4e2dc]">
          <div className="mx-auto max-w-5xl px-6">
            <div className="bg-white border border-[#e4e2dc] rounded-[32px] p-10 sm:p-18 text-center relative overflow-hidden shadow-sm">
              <div className="mx-auto mb-6 flex items-center justify-center">
                <Image
                  src="/mirai-logo-trimmed.png"
                  alt="Mirai"
                  width={110}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-[#0a0f1d] tracking-tight leading-tight max-w-2xl mx-auto">
                The future is a team sport.
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                Be part of the first wave building what comes next. Claim your priority spot on the private beta.
              </p>

              <div className="mt-8 max-w-md mx-auto text-left">
                <WaitlistForm idPrefix="closing" compact />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── MULTI-COLUMN FOOTER WITH OFBRAIN ATTRIBUTION ONLY HERE ─── */}
      <footer className="border-t border-[#e4e2dc] bg-white pt-16 pb-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 sm:grid-cols-4 mb-14">
            {/* Col 1: Brand & Parent Company Lockup */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <Image
                  src="/mirai-logo-trimmed.png"
                  alt="Mirai"
                  width={85}
                  height={28}
                  className="h-6 w-auto object-contain"
                />
                <span className="text-xs text-slate-400 font-medium select-none">by</span>
                <a
                  href="https://ofbrain.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit ofbrain website (opens in a new tab)"
                  className="inline-flex items-center opacity-85 hover:opacity-100 transition-opacity"
                >
                  <Image
                    src="/ofbrain-wordmark.png"
                    alt="ofbrain"
                    width={65}
                    height={20}
                    className="h-4.5 w-auto object-contain -mt-0.5"
                  />
                </a>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mt-3">
                Mirai is a collaborative platform for idea-stage founders, builders, and students to find their co-founders and build the future together. An initiative by ofbrain.
              </p>
            </div>

            {/* Col 2: Platform Links */}
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</p>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li><a href="#startups" className="hover:text-slate-900 transition-colors">Startups</a></li>
                <li><a href="#cofounders" className="hover:text-slate-900 transition-colors">Co-Founders</a></li>
                <li><a href="#community" className="hover:text-slate-900 transition-colors">Community</a></li>
                <li><a href="#hackathons" className="hover:text-slate-900 transition-colors">Hackathons</a></li>
              </ul>
            </div>

            {/* Col 3: Legal & Parent Link */}
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li><Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                <li>
                  <a
                    href="https://ofbrain.site/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2773ff] transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    ofbrain.site ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 Mirai. All rights reserved.</p>
            <p>Parent company: ofbrain (https://ofbrain.site/)</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
