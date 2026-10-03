import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Mirai',
  description: 'Mirai Platform Terms of Service and Builder Agreement',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-space text-ink px-6 py-16 sm:px-12 sm:py-24 max-w-4xl mx-auto">
      <div className="aurora" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      
      <Link href="/" className="glass-button inline-flex mb-12 !px-4 !py-2 text-xs">
        ← Back to Mirai
      </Link>

      <div className="glass-strong rounded-3xl p-8 sm:p-12 border border-white/10">
        <p className="eyebrow text-violet">Legal & Terms</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-ink/45">Effective Date: March 1, 2026 · Version 1.0.0</p>

        <div className="mt-8 space-y-8 text-ink/75 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-ink mb-2">1. Welcome to Mirai</h2>
            <p>
              By accessing Mirai, creating an account, or joining our waitlist, you agree to these Terms of Service. Mirai provides a collaborative platform for founders, builders, and creators to connect, form teams, and discover early-stage startups.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-ink mb-2">2. Builder Code of Conduct</h2>
            <p>
              Mirai thrives on trust and mutual respect. You agree to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-ink/65">
              <li>Represent your skills, experience, and startup projects honestly.</li>
              <li>Respect the intellectual property and confidentiality of other builders.</li>
              <li>Never spam, scrape, or abuse the matching deck or community channels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-ink mb-2">3. Intellectual Property</h2>
            <p>
              You own all intellectual property rights to the startups, code, ideas, and pitch decks you share on Mirai. Mirai does not claim ownership over any user projects.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-ink mb-2">4. Contact & Queries</h2>
            <p>
              If you have any questions regarding these terms, reach out to us at <span className="text-violet">legal@mirai.in</span>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
