import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mirai — Build the future, together.',
  description: 'A home for bold ideas, curious builders, and the people you have not met yet.',
  generator: 'v0.app',
  openGraph: { title: 'Mirai — Build the future, together.', description: 'Find your co-founder, get discovered, and make your next move.', images: ['/logo.png'] },
  icons: { icon: '/logo.png', apple: '/logo.png' },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#eef6fb', userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
