// Utility Functions for Onchain Creator Hub

/**
 * Format an Ethereum address for display
 * @param address The full address
 * @param chars Number of characters to show on each side (default: 4)
 * @returns Formatted address like "0x1234...5678"
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2) return address
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format a number for display with appropriate suffix
 * @param num The number to format
 * @returns Formatted string with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}

/**
 * Format USD amount for display
 * @param amount The amount in USD
 * @returns Formatted USD string
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format timestamp to relative time
 * @param timestamp The timestamp to format
 * @returns Relative time string like "2 hours ago"
 */
export function formatRelativeTime(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`
  return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
}

/**
 * Generate a random ID
 * @param length The length of the ID (default: 16)
 * @returns Random hex string
 */
export function generateId(length: number = 16): string {
  const chars = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/**
 * Truncate text with ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Parse error message from various error types
 * @param error The error object
 * @returns Error message string
 */
export function parseError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'An unknown error occurred'
}

/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce a function
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Classnames helper for conditional classes
 * @param classes Object or array of classes
 * @returns Combined class string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get chain name from chain ID
 * @param chainId The chain ID
 * @returns Chain name
 */
export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    84532: 'Base Sepolia',
    10: 'Optimism',
    42161: 'Arbitrum',
  }
  return chains[chainId] || `Chain ${chainId}`
}

/**
 * Validate Ethereum address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format bytes to human readable format
 * @param bytes Number of bytes
 * @returns Formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get status color for bounty status
 * @param status The status string
 * @returns Color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'badge-success',
    IN_PROGRESS: 'badge-warning',
    COMPLETED: 'badge-primary',
    CANCELLED: 'badge-error',
    EXPIRED: 'badge-error',
  }
  return colors[status] || 'badge'
}

/**
 * Get tier badge properties
 * @param tier The tier name
 * @returns Object with badge properties
 */
export function getTierInfo(tier: string): { label: string; color: string } {
  const tiers: Record<string, { label: string; color: string }> = {
    NONE: { label: 'Free', color: 'badge' },
    STARTER: { label: 'Starter', color: 'badge-primary' },
    PRO: { label: 'Pro', color: 'badge-success' },
    POWER: { label: 'Power', color: 'badge-warning' },
  }
  return tiers[tier] || { label: tier, color: 'badge' }
}
