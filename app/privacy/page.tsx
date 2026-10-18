import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Privacy Policy — Mirai',
  description: 'Mirai Privacy Policy and Data Handling Principles',
}

export default function PrivacyPage() {
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
          Legal & Transparency
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-slate-400">Effective Date: March 1, 2026 · Version 1.0.0</p>

        <div className="mt-8 space-y-8 text-slate-600 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Our Core Principle</h2>
            <p>
              At Mirai, we believe your personal data belongs to you. We collect only what is strictly necessary to connect you with co-founders, startups, and builder communities. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
              <li>
                <strong>Waitlist & Profile Data:</strong> Email address, role preferences (Founder, Builder, Student), skills, and project interests.
              </li>
              <li>
                <strong>Security & Authentication:</strong> Anonymized SHA-256 IP hashes and rate limiting tokens (stored temporarily in Upstash Redis) to prevent spam and DDoS abuse.
              </li>
              <li>
                <strong>Usage Analytics:</strong> Anonymized platform interactions to optimize matching algorithms and platform speed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. How We Use Your Data</h2>
            <p>
              We use your data to send waitlist confirmations via Resend, facilitate co-founder matches, manage hackathon registrations, and notify you when early access spots become available.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Data Deletion & Rights</h2>
            <p>
              You have the right to request deletion or export of your account and personal data at any time. Simply contact us at{' '}
              <span className="font-semibold text-[#0074db]">privacy@mymirai.site</span> and we will honor your request within 7 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
