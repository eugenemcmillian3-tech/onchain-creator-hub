'use client'

import Link from 'next/link'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'
import { WalletConnect } from './WalletConnect'
import { Menu, X, Sparkles } from 'lucide-react'

export function Header() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/bounties', label: 'Bounties' },
    { href: '/passes', label: 'Passes' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/pricing', label: 'Pricing' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-10 h-10 rounded-xl bg-base flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:inline">Onchain Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-muted hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="hidden md:flex items-center gap-4">
                <WalletConnect />
                <button
                  onClick={() => disconnect()}
                  className="btn-ghost text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <WalletConnect />
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-muted hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <Link
                  href="/dashboard"
                  className="text-text-muted hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
