import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onchain Creator & Bounty Hub',
  description: 'A Base + Farthercast dApp for creators and hunters. Pay-per-action Frames, creator passes, escrowed bounties, and analytics.',
  keywords: ['Base', 'Farthercast', 'Web3', 'Creator', 'Bounty', 'NFT', 'Frame'],
  openGraph: {
    title: 'Onchain Creator & Bounty Hub',
    description: 'Create, earn, and collaborate on Base chain',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onchain Creator & Bounty Hub',
    description: 'Create, earn, and collaborate on Base chain',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
