import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mymirai.site'),
  title: 'Mirai — Build the future, together.',
  description: 'A home for bold ideas, curious builders, and the people you have not met yet. By ofbrain.',
  openGraph: {
    title: 'Mirai — Build the future, together.',
    description: 'Find your co-founder, get discovered, and make your next move.',
    images: ['/mirai-logo-trimmed.png'],
  },
  icons: { icon: '/mirai-logo-trimmed.png', apple: '/mirai-logo-trimmed.png' },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#ffffff', userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased font-sans bg-white text-[#000e29] selection:bg-[#eef5ff] selection:text-[#0074db]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
