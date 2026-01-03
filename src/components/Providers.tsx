'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected } from 'wagmi/connectors'
import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { ReactNode, useState } from 'react'

// Wagmi configuration with Base network
const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(),
  },
  connectors: [
    injected({ target: 'metaMask' }),
  ],
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
