import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Terms of Service — Mirai',
  description: 'Mirai Platform Terms of Service and Builder Agreement',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#000e29] px-6 py-12 sm:px-12 sm:py-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-8 border-b border-slate-100 mb-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mirai-logo-trimmed.png"
            alt="Mirai"
            width={85}
            height={28}
            className="h-6 w-auto object-contain"
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          ← Back to Mirai
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs">
        <span className="text-xs font-semibold text-[#0074db] tracking-wider uppercase">
          Legal & Terms
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-slate-400">Effective Date: March 1, 2026 · Version 1.0.0</p>

        <div className="mt-8 space-y-8 text-slate-600 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Welcome to Mirai</h2>
            <p>
              By accessing Mirai, creating an account, or joining our waitlist, you agree to these Terms of Service. Mirai provides a collaborative platform for founders, builders, and creators to connect, form teams, and discover early-stage startups.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Builder Code of Conduct</h2>
            <p>
              Mirai thrives on trust and mutual respect. You agree to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-slate-600">
              <li>Represent your skills, experience, and startup projects honestly.</li>
              <li>Respect the intellectual property and confidentiality of other builders.</li>
              <li>Never spam, scrape, or abuse the matching deck or community channels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Intellectual Property</h2>
            <p>
              You own all intellectual property rights to the startups, code, ideas, and pitch decks you share on Mirai. Mirai does not claim ownership over any user projects.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Contact & Queries</h2>
            <p>
              If you have any questions regarding these terms, reach out to us at{' '}
              <span className="font-semibold text-[#0074db]">legal@mymirai.site</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
