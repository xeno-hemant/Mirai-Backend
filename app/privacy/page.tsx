import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Mirai',
  description: 'Mirai Privacy Policy and Data Handling Principles',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-space text-ink px-6 py-16 sm:px-12 sm:py-24 max-w-4xl mx-auto">
      <div className="aurora" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      
      <Link href="/" className="glass-button inline-flex mb-12 !px-4 !py-2 text-xs">
        ← Back to Mirai
      </Link>

      <div className="glass-strong rounded-3xl p-8 sm:p-12 border border-white/10">
        <p className="eyebrow text-sky">Legal & Transparency</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink/45">Effective Date: March 1, 2026 · Version 1.0.0</p>

        <div className="mt-8 space-y-8 text-ink/75 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-ink mb-2">1. Our Core Principle</h2>
            <p>
              At Mirai, we believe your personal data belongs to you. We collect only what is strictly necessary to connect you with co-founders, startups, and builder communities. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-ink mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-ink/65">
              <li><strong>Waitlist & Profile Data:</strong> Email address, role preferences (Founder, Builder, Student), skills, and project interests.</li>
              <li><strong>Security & Authentication:</strong> Anonymized SHA-256 IP hashes and rate limiting tokens (stored temporarily in Upstash Redis) to prevent spam and DDoS abuse.</li>
              <li><strong>Usage Analytics:</strong> Anonymized platform interactions to optimize matching algorithms and platform speed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-ink mb-2">3. How We Use Your Data</h2>
            <p>
              We use your data to send waitlist confirmations via Resend, facilitate co-founder matches, manage hackathon registrations, and notify you when early access spots become available.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-ink mb-2">4. Data Deletion & Rights</h2>
            <p>
              You have the right to request deletion or export of your account and personal data at any time. Simply contact us at <span className="text-sky">privacy@mirai.in</span> and we will honor your request within 7 business days.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
