import { parseEther, parseUnits } from 'viem'
import { isAdminWallet } from './wallet-detector'
import { db } from './db'

export interface PaymentConfig {
  amount: number
  toWallet: string
  chain: string
  token?: string
  fromWallet?: string
  platform: 'farcaster' | 'base-app'
  featureUsed: 'lore' | 'promo'
  userId?: string
}

export interface PaymentResult {
  success: boolean
  txHash?: string
  confirmations?: number
  status: 'success' | 'failed' | 'pending' | 'admin-free'
  message?: string
  logId?: string
}

export const SUPPORTED_CHAINS = {
  'base-app': ['ethereum', 'polygon', 'base', 'avalanche', 'fantom', 'arbitrum', 'optimism'],
  farcaster: ['base', 'ethereum', 'arbitrum', 'solana', 'bsc', 'monad', 'hyperevm', 'celo'],
}

export const CHAIN_CONFIG = {
  ethereum: { chainId: 1, token: 'USDC', decimals: 6 },
  polygon: { chainId: 137, token: 'USDC', decimals: 6 },
  base: { chainId: 8453, token: 'USDC', decimals: 6 },
  avalanche: { chainId: 43114, token: 'USDC', decimals: 6 },
  fantom: { chainId: 250, token: 'USDC', decimals: 6 },
  arbitrum: { chainId: 42161, token: 'USDC', decimals: 6 },
  optimism: { chainId: 10, token: 'USDC', decimals: 6 },
  solana: { chainId: null, token: 'USDC-SPL', decimals: 6 },
  bsc: { chainId: 56, token: 'USDC', decimals: 18 },
  monad: { chainId: null, token: 'USDC', decimals: 6 },
  hyperevm: { chainId: null, token: 'USDC', decimals: 6 },
  celo: { chainId: 42220, token: 'USDC', decimals: 6 },
}

export async function initiatePayment(config: PaymentConfig): Promise<PaymentResult> {
  const { amount, toWallet, chain, fromWallet, platform, featureUsed, userId } = config

  if (fromWallet && isAdminWallet(fromWallet)) {
    const log = await db.transactionLog.create({
      data: {
        userId,
        amount: 0,
        currency: 'FREE',
        fromWallet,
        toWallet,
        chain,
        platform,
        featureUsed,
        status: 'SUCCESS',
        confirmedAt: new Date(),
      },
    })

    return {
      success: true,
      status: 'admin-free',
      message: 'Admin wallet - free access, network fees only',
      logId: log.id,
    }
  }

  if (!fromWallet) {
    return {
      success: false,
      status: 'failed',
      message: 'No wallet connected',
    }
  }

  if (!SUPPORTED_CHAINS[platform].includes(chain.toLowerCase())) {
    return {
      success: false,
      status: 'failed',
      message: `Chain ${chain} not supported for ${platform}`,
    }
  }

  const chainConfig = CHAIN_CONFIG[chain.toLowerCase() as keyof typeof CHAIN_CONFIG]
  if (!chainConfig) {
    return {
      success: false,
      status: 'failed',
      message: `Invalid chain: ${chain}`,
    }
  }

  const log = await db.transactionLog.create({
    data: {
      userId,
      amount,
      currency: chainConfig.token,
      fromWallet,
      toWallet,
      chain,
      platform,
      featureUsed,
      status: 'PENDING',
    },
  })

  try {
    return {
      success: true,
      status: 'pending',
      message: `Payment of $${amount} initiated. Please complete the transaction in your wallet.`,
      logId: log.id,
    }
  } catch (error) {
    await db.transactionLog.update({
      where: { id: log.id },
      data: { status: 'FAILED' },
    })

    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Payment failed',
      logId: log.id,
    }
  }
}

export async function confirmPayment(logId: string, txHash: string): Promise<void> {
  await db.transactionLog.update({
    where: { id: logId },
    data: {
      status: 'SUCCESS',
      txHash,
      confirmedAt: new Date(),
    },
  })
}

export async function updateFeatureAccess(
  walletAddress: string,
  platform: 'farcaster' | 'base-app',
  cost: number
): Promise<void> {
  await db.featureAccess.upsert({
    where: {
      walletAddress_platform: {
        walletAddress,
        platform,
      },
    },
    update: {
      lastAccessedAt: new Date(),
      totalUsageCost: {
        increment: cost,
      },
    },
    create: {
      walletAddress,
      platform,
      lastAccessedAt: new Date(),
      totalUsageCost: cost,
    },
  })
}

export function formatPaymentMessage(
  amount: number,
  toWallet: string,
  chains: string[]
): string {
  return `Payment: $${amount.toFixed(2)} to ${toWallet.slice(0, 6)}...${toWallet.slice(-4)}. Supported chains: ${chains.join(', ')}.`
}

export function getChainName(chainId: number): string | null {
  const entry = Object.entries(CHAIN_CONFIG).find(([_, config]) => config.chainId === chainId)
  return entry ? entry[0] : null
}
