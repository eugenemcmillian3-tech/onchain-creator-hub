'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useState, useEffect } from 'react'
import { Loader2, Copy, Check, ExternalLink, Shield } from 'lucide-react'
import { formatAddress } from '@/lib/utils'
import { detectSource, getSourceWallet, isAdminWallet } from '@/lib/wallet-detector'

export function WalletConnect() {
  const { isConnected, address, chainId } = useAccount()
  const { connect, isPending, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [source, setSource] = useState<'farcaster' | 'base-app' | 'direct'>('direct')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const detectedSource = detectSource()
    setSource(detectedSource)
    
    if (address) {
      setIsAdmin(isAdminWallet(address))
    }
  }, [address])

  useEffect(() => {
    const lastConnected = localStorage.getItem('lastConnectedWallet')
    if (lastConnected && !isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }, [isConnected, connectors, connect])

  const handleConnect = async () => {
    try {
      const connector = connectors[0] || injected()
      connect({ connector })
      localStorage.setItem('lastConnectedWallet', 'injected')
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    localStorage.removeItem('lastConnectedWallet')
    setShowDropdown(false)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const viewOnExplorer = () => {
    const baseUrl = chainId === 84532 
      ? 'https://sepolia.basescan.io/address/'
      : 'https://basescan.org/address/'
    window.open(`${baseUrl}${address}`, '_blank')
  }

  if (isConnected && address) {
    return (
      <div className="relative flex items-center gap-2">
        {isAdmin && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 border border-primary/40">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Admin</span>
          </div>
        )}
        {source !== 'direct' && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-base/20 border border-base/40">
            <span className="text-xs font-medium text-base">
              {source === 'farcaster' ? 'Farcaster' : 'Base App'}
            </span>
          </div>
        )}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-primary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-base/20 flex items-center justify-center">
            <span className="text-base text-sm font-bold">
              {address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium">{formatAddress(address)}</p>
            <p className="text-xs text-text-muted">
              {balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0'} {balance?.symbol}
            </p>
          </div>
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-border">
                <p className="text-sm text-text-muted">Connected Wallet</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">{formatAddress(address)}</p>
                  <button
                    onClick={copyAddress}
                    className="text-text-muted hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={viewOnExplorer}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-surface-light rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="btn btn-primary flex items-center gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          Connect Wallet
        </>
      )}
    </button>
  )
}
