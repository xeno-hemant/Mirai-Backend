'use client'

import { motion } from 'framer-motion'
import { Check, ChevronDown, Compass, Globe2, Heart, Menu, Rocket, Sparkles, Users, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

const navItems = ['Startups', 'Co-Founders', 'Community', 'Hackathons']
const features = [
  { icon: Rocket, eyebrow: 'Build in public', title: 'Startup profiles', copy: 'Turn your early idea into a magnet for the right people, feedback, and momentum.', tint: 'blue' },
  { icon: Users, eyebrow: 'Find your people', title: 'Co-founder match', copy: 'Meet builders whose ambition, skills, and working rhythm fit yours.', tint: 'violet' },
  { icon: Globe2, eyebrow: 'Stay in the loop', title: 'Community feed', copy: 'Plug into the local ecosystems and conversations moving ideas forward.', tint: 'mint' },
  { icon: Zap, eyebrow: 'Make something real', title: 'Hackathon hub', copy: 'Discover events, form teams, and ship alongside people who get it.', tint: 'sky' },
]
const faqs = [
  ['Who is Mirai for?', 'Mirai is for idea-stage founders, builders, and students who want to meet collaborators and turn momentum into something real.'],
  ['Is it free to join?', 'Yes. The core community and discovery experience will be free while we build the first version together.'],
  ['When does Mirai launch?', 'We are inviting the first wave of builders soon. Join the waitlist and we will keep you in the loop.'],
]

function Logo({ className = '', symbolOnly = false }: { className?: string; symbolOnly?: boolean }) {
  if (symbolOnly) return <span className={`logo-symbol ${className}`} aria-hidden="true"><img src="/mirai-symbol-white.png" alt="" /></span>
  return <div className={`logo-chip ${className}`}><img src="/mirai-logo.png" alt="Mirai logo" className="h-32 w-auto object-contain" /></div>
}

function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Founder')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!email.includes('@')) { setStatus('error'); setMessage('Enter a valid email to join.'); return }
    setStatus('loading')
    const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
    const data = await response.json()
    setStatus(response.ok ? 'success' : 'error')
    setMessage(data.message)
  }
  if (status === 'success') return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-strong flex items-center gap-4 rounded-3xl p-5"><div className="grid size-11 shrink-0 place-items-center rounded-full bg-mint text-space"><Check /></div><div><p className="text-lg text-ink">You&apos;re on the list.</p><p className="text-sm text-ink/60">We&apos;ll save you a spot, {email}.</p></div></motion.div>
  return <form onSubmit={submit} className={`glass-strong rounded-3xl p-3 ${compact ? '' : 'sm:p-4'}`}>
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor={compact ? 'email-compact' : 'email'}>Email address</label>
      <input id={compact ? 'email-compact' : 'email'} value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="glass-input min-w-0 flex-1" type="email" required />
      {!compact && <label className="sr-only" htmlFor="role">I am a</label>}
      {!compact && <select id="role" value={role} onChange={e => setRole(e.target.value)} className="glass-input sm:w-36"><option>Founder</option><option>Builder</option><option>Student</option></select>}
      <button className="glass-button whitespace-nowrap" disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Join the waitlist'}</button>
    </div>
    {status === 'error' && <p role="alert" className="px-2 pt-2 text-sm text-sky">{message}</p>}
  </form>
}

export default function Page() {
  const [openFaq, setOpenFaq] = useState(0)
  const [builderCount, setBuilderCount] = useState(1200)
  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => { if (typeof d?.count === 'number') setBuilderCount(d.count) })
      .catch(() => {})
  }, [])
  return <main className="min-h-screen overflow-hidden bg-space text-ink">
    <div className="aurora" aria-hidden="true" /><div className="noise" aria-hidden="true" />
    <header className="sticky top-4 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-full border border-white/10 bg-space/70 px-3 py-2 shadow-2xl backdrop-blur-xl sm:px-5">
      <Link href="#top" aria-label="Mirai home"><Logo /></Link>
      <nav className="hidden items-center gap-7 lg:flex">{navItems.map((item) => <a key={item} href={`#${item.toLowerCase().replace('-', '')}`} className="text-sm text-ink/60 transition hover:text-ink">{item}</a>)}</nav>
      <a href="#waitlist" className="glass-button hidden !px-5 !py-2.5 sm:flex">Join waitlist</a><button className="glass-icon sm:hidden" aria-label="Open navigation"><Menu /></button>
    </header>

    <section id="top" className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-24 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pb-36 lg:pt-32">
      <div><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="mb-7 flex items-center gap-3"><span className="status-dot" /> <span className="eyebrow">The builder community, reimagined</span></motion.div><motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .8 }} className="max-w-3xl text-6xl leading-[.98] tracking-[-.045em] sm:text-8xl">Build the <span className="gradient-text italic">future.</span><br />Together.</motion.h1><motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .8 }} className="mt-7 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl">A home for bold ideas, curious builders, and the people you haven&apos;t met yet. Find your co-founder, get discovered, and make your next move.</motion.p><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: .8 }} className="mt-9 max-w-xl"><WaitlistForm /><p className="mt-4 flex items-center gap-2 text-sm text-ink/45"><span className="flex -space-x-2"><span className="avatar bg-violet">A</span><span className="avatar bg-blue">K</span><span className="avatar bg-mint text-space">R</span></span> Join {builderCount.toLocaleString()}+ builders shaping what&apos;s next</p></motion.div></div>
      <motion.div initial={{ opacity: 0, scale: .94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .25, duration: 1 }} className="relative mx-auto w-full max-w-md"><div className="hero-orbit" /><div className="glass-strong relative rounded-[2rem] p-6 sm:p-8"><Logo className="mb-10 w-fit" /><div className="flex items-end justify-between"><div><p className="eyebrow">Your next chapter</p><p className="mt-3 text-4xl tracking-tight">Starts here<span className="text-blue">.</span></p></div><Sparkles className="mb-1 text-sky" /></div><div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5"><span className="text-sm text-ink/45">Ideas in motion</span><span className="text-sm text-mint">+ 24% this week</span></div></div><div className="glass absolute -bottom-5 -left-5 rounded-2xl p-4 shadow-xl"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-mint text-space"><Heart /></div><div><p className="text-sm">New connection</p><p className="text-xs text-ink/45">You have things in common</p></div></div></div></motion.div>
    </section>

    <section className="mx-auto max-w-6xl px-5 pb-28 sm:px-8"><div className="section-rule mb-14" /><div className="grid gap-5 sm:grid-cols-3"><div><p className="eyebrow">01 / Why Mirai</p><p className="mt-4 text-2xl leading-snug text-ink/85">The best things are built <span className="italic text-sky">together.</span></p></div><p className="text-ink/55 sm:col-span-2 sm:pl-8 sm:text-lg sm:leading-relaxed">Mirai brings your startup journey into one thoughtful space — from the first spark of an idea to the moment you find the people who make it real.</p></div></section>

    <section id="startups" className="mx-auto max-w-6xl px-5 pb-28 sm:px-8"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow">The ecosystem</p><h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">Everything you need<br /><span className="gradient-text italic">to move forward.</span></h2></div><Compass className="hidden size-12 text-violet/70 sm:block" /></div><div className="grid gap-4 md:grid-cols-2">{features.map((feature, index) => { const Icon = feature.icon; return <motion.article key={feature.title} whileHover={{ y: -5 }} className={`feature-card tint-${feature.tint} ${index === 0 ? 'md:row-span-2' : ''}`}><div className="flex items-start justify-between"><div className="icon-box"><Icon /></div><span className="eyebrow">0{index + 1}</span></div><div className={index === 0 ? 'mt-36 sm:mt-48' : 'mt-16'}><p className="eyebrow">{feature.eyebrow}</p><h3 className="mt-2 text-2xl">{feature.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">{feature.copy}</p></div></motion.article> })}</div></section>

    <section id="cofounders" className="mx-auto max-w-6xl px-5 pb-28 sm:px-8"><div className="glass-strong grid gap-10 overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="eyebrow">A better way to meet</p><h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Your next<br /><span className="gradient-text italic">great co-founder</span><br />is out there.</h2><p className="mt-5 max-w-md leading-relaxed text-ink/55">No awkward networking. No endless scrolling. Just thoughtful matches based on how you think, work, and want to grow.</p><a href="#waitlist" className="glass-button mt-7 inline-flex">Find your people  ↗</a></div><div className="relative mx-auto w-full max-w-lg"><div className="match-stack"><div className="match-card back-card"><div className="match-photo bg-violet">M</div></div><div className="match-card middle-card"><div className="match-photo bg-blue">J</div></div><div className="match-card front-card"><div className="flex items-center gap-4"><div className="match-photo bg-mint text-space">S</div><div><p className="text-xl">Sana Mehta</p><p className="text-sm text-ink/50">Product + community</p></div><span className="ml-auto rounded-full bg-mint/20 px-3 py-1 text-xs" style={{color: '#0090ff'}}>92%</span></div><div className="mt-8 flex flex-wrap gap-2"><span className="tag">Product thinking</span><span className="tag">Climate</span><span className="tag">Remote</span></div><div className="mt-8 flex gap-3"><button className="glass-icon"><X /></button><button className="glass-button flex-1 justify-center"><Heart /> Connect</button></div></div></div></div></div></section>

    <section id="community" className="mx-auto max-w-6xl px-5 pb-28 sm:px-8"><div className="grid gap-5 md:grid-cols-3"><div className="glass rounded-3xl p-6 md:col-span-2"><p className="eyebrow">03 / Community</p><h2 className="mt-4 max-w-lg text-4xl leading-tight">The room where<br /><span className="italic text-sky">ideas get louder.</span></h2><div className="mt-12 flex items-end justify-between border-t border-white/10 pt-5"><div className="flex -space-x-3"><span className="avatar large bg-blue">N</span><span className="avatar large bg-violet">T</span><span className="avatar large bg-mint text-space">V</span><span className="avatar large bg-sky text-space">+</span></div><span className="text-sm text-ink/45">Local groups · AMAs · honest updates</span></div></div><div className="glass tint-mint rounded-3xl p-6"><div className="flex items-center justify-between"><span className="eyebrow">Live now</span><span className="status-dot mint" /></div><p className="mt-12 text-2xl">Build in public.<br /><span className="text-ink/45">Find your signal.</span></p><p className="mt-6 text-sm leading-relaxed text-ink/55">Join conversations with people building from Jaipur to everywhere.</p></div></div></section>

    <section id="hackathons" className="mx-auto max-w-6xl px-5 pb-28 sm:px-8"><div className="glass tint-violet rounded-[2rem] p-6 sm:p-10"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="eyebrow">04 / Hackathons</p><h2 className="mt-4 text-4xl sm:text-5xl">Ship something<br /><span className="gradient-text italic">unexpected.</span></h2></div><p className="max-w-sm text-ink/55">Find your next challenge, form a sharp team, and make a weekend count.</p></div><div className="mt-12 grid gap-3 sm:grid-cols-3"><div className="glass rounded-2xl p-5"><p className="eyebrow">01 — Discover</p><p className="mt-10 text-xl">Ideas worth chasing</p></div><div className="glass rounded-2xl p-5"><p className="eyebrow">02 — Form</p><p className="mt-10 text-xl">Teams that click</p></div><div className="glass rounded-2xl p-5"><p className="eyebrow">03 — Ship</p><p className="mt-10 text-xl">Proof you can show</p></div></div></div></section>

    <section className="mx-auto max-w-3xl px-5 pb-28 sm:px-8"><p className="eyebrow">A few good questions</p><h2 className="mt-3 text-4xl sm:text-5xl">Before you <span className="gradient-text italic">join.</span></h2><div className="mt-8 flex flex-col gap-3">{faqs.map(([q, a], index) => <div key={q} className="glass rounded-2xl"><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between p-5 text-left text-lg" aria-expanded={openFaq === index}>{q}<ChevronDown className={`transition-transform ${openFaq === index ? 'rotate-180 text-sky' : 'text-ink/40'}`} /></button>{openFaq === index && <p className="px-5 pb-5 leading-relaxed text-ink/55">{a}</p>}</div>)}</div></section>

    <section id="waitlist" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8"><div className="relative overflow-hidden rounded-[2rem] border border-blue/30 bg-blue/10 p-7 text-center sm:p-14"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(123,97,255,.3),transparent_60%)]" /><div className="relative"><Logo className="mx-auto mb-8 w-fit" /><h2 className="mx-auto max-w-2xl text-4xl leading-tight sm:text-6xl">The future is a<br /><span className="gradient-text italic">team sport.</span></h2><p className="mx-auto mt-5 max-w-md text-ink/60">Be part of the first wave building what comes next.</p><div className="mx-auto mt-8 max-w-xl text-left"><WaitlistForm compact /></div></div></div></section>

    <footer className="mx-auto flex max-w-6xl flex-col gap-5 border-t border-white/10 px-5 py-8 text-sm text-ink/45 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Logo /><p>Made for people who make things.</p><p>© 2026 Mirai</p></footer>
  </main>
}
