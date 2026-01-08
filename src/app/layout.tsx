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
      <head>
        <link rel="manifest" href="/.well-known/farcaster.json" />
        <link rel="alternate" type="application/json+farcaster" href="/.well-known/farcaster.json" />
        <link rel="alternate" type="application/json+base" href="/.well-known/base.json" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/images/frame-home.png`} />
        <meta property="fc:frame:button:1" content="Launch App" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={process.env.NEXT_PUBLIC_APP_URL} />
      </head>
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
