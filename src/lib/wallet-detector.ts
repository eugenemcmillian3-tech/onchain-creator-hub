export type WalletSource = 'farcaster' | 'base-app' | 'direct'

export interface SourceWallet {
  source: WalletSource
  walletAddress: string
  solanaAddress?: string
  fid: number
  supportedChains: string[]
  isAdmin: boolean
}

const WALLET_A_ADDRESS = process.env.NEXT_PUBLIC_BASE_APP_WALLET || '0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752'
const WALLET_B_EVM = process.env.NEXT_PUBLIC_FARCASTER_WALLET_EVM || '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3'
const WALLET_B_SOLANA = process.env.NEXT_PUBLIC_FARCASTER_WALLET_SOLANA || 'BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7'

const BASE_APP_FID = parseInt(process.env.NEXT_PUBLIC_BASE_APP_FID || '1644948')
const FARCASTER_FID = parseInt(process.env.NEXT_PUBLIC_FARCASTER_FID || '1378286')

export function detectSource(): WalletSource {
  if (typeof window === 'undefined') return 'direct'
  
  const urlParams = new URLSearchParams(window.location.search)
  const source = urlParams.get('source')
  const referrer = document.referrer.toLowerCase()
  
  if (source === 'base-app' || referrer.includes('base.org')) {
    return 'base-app'
  }
  
  if (
    source === 'farcaster' ||
    referrer.includes('warpcast.com') ||
    referrer.includes('farcaster') ||
    window.location.pathname.startsWith('/fc/')
  ) {
    return 'farcaster'
  }
  
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('warpcast') || userAgent.includes('farcaster')) {
    return 'farcaster'
  }
  
  return 'direct'
}

export function getSourceWallet(source?: WalletSource): SourceWallet {
  const detectedSource = source || detectSource()
  
  switch (detectedSource) {
    case 'base-app':
      return {
        source: 'base-app',
        walletAddress: WALLET_A_ADDRESS,
        fid: BASE_APP_FID,
        supportedChains: ['ethereum', 'polygon', 'base', 'avalanche', 'fantom', 'arbitrum', 'optimism'],
        isAdmin: true,
      }
    
    case 'farcaster':
      return {
        source: 'farcaster',
        walletAddress: WALLET_B_EVM,
        solanaAddress: WALLET_B_SOLANA,
        fid: FARCASTER_FID,
        supportedChains: ['base', 'ethereum', 'arbitrum', 'solana', 'bsc', 'monad', 'hyperevm', 'celo'],
        isAdmin: true,
      }
    
    default:
      return {
        source: 'direct',
        walletAddress: WALLET_A_ADDRESS,
        fid: BASE_APP_FID,
        supportedChains: ['ethereum', 'polygon', 'base', 'avalanche', 'fantom', 'arbitrum', 'optimism'],
        isAdmin: false,
      }
  }
}

export function isAdminWallet(address: string): boolean {
  const normalizedAddress = address.toLowerCase()
  return (
    normalizedAddress === WALLET_A_ADDRESS.toLowerCase() ||
    normalizedAddress === WALLET_B_EVM.toLowerCase()
  )
}

export function getPaymentWallet(platform: 'farcaster' | 'base-app'): {
  address: string
  solanaAddress?: string
  chains: string[]
} {
  if (platform === 'base-app') {
    return {
      address: WALLET_A_ADDRESS,
      chains: ['ethereum', 'polygon', 'base', 'avalanche', 'fantom', 'arbitrum', 'optimism'],
    }
  }
  
  return {
    address: WALLET_B_EVM,
    solanaAddress: WALLET_B_SOLANA,
    chains: ['base', 'ethereum', 'arbitrum', 'solana', 'bsc', 'monad', 'hyperevm', 'celo'],
  }
}

export function detectFIDFromRequest(headers: Headers): number | null {
  const fid = headers.get('x-farcaster-fid') || headers.get('fid')
  return fid ? parseInt(fid) : null
}

export function getPlatformFromFID(fid: number): 'farcaster' | 'base-app' | null {
  if (fid === FARCASTER_FID) return 'farcaster'
  if (fid === BASE_APP_FID) return 'base-app'
  return null
}
