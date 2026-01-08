'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ticket, TrendingUp, Users, Shield, Plus, Search } from 'lucide-react'

export default function PassesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const mockPasses = [
    {
      id: '1',
      name: 'Creator Pro Access',
      symbol: 'CPA',
      creator: '0x123...abc',
      image: '/images/pass-1.png',
      holders: 245,
      price: 0.05,
      maxSupply: 1000,
      isSoulbound: false,
      benefits: ['Exclusive content', 'Priority support', 'Early access'],
    },
    {
      id: '2',
      name: 'VIP Member Pass',
      symbol: 'VMP',
      creator: '0x456...def',
      image: '/images/pass-2.png',
      holders: 89,
      price: 0.1,
      maxSupply: 500,
      isSoulbound: true,
      benefits: ['All Pro benefits', '1-on-1 sessions', 'Revenue share'],
    },
    {
      id: '3',
      name: 'Community Pass',
      symbol: 'COMM',
      creator: '0x789...ghi',
      image: '/images/pass-3.png',
      holders: 567,
      price: 0.02,
      maxSupply: 5000,
      isSoulbound: false,
      benefits: ['Discord access', 'Weekly updates', 'Vote on decisions'],
    },
  ]

  const filteredPasses = mockPasses.filter(pass =>
    pass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pass.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Creator Passes</h1>
        <p className="text-text-muted max-w-2xl">
          Mint and collect creator access passes. Unlock exclusive content, communities, and benefits.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search passes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <Link href="/passes/create" className="btn btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-5 h-5" />
          Create Pass
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Total Collections</div>
          <div className="text-2xl font-bold">{mockPasses.length}</div>
        </div>
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Total Holders</div>
          <div className="text-2xl font-bold">{mockPasses.reduce((acc, p) => acc + p.holders, 0)}</div>
        </div>
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Floor Price</div>
          <div className="text-2xl font-bold">{Math.min(...mockPasses.map(p => p.price))} ETH</div>
        </div>
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Total Volume</div>
          <div className="text-2xl font-bold">42.5 ETH</div>
        </div>
      </div>

      {/* Passes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPasses.map((pass) => (
          <div key={pass.id} className="card hover:border-primary/50 transition-all overflow-hidden">
            {/* Pass Image */}
            <div className="aspect-square bg-surface-light rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <Ticket className="w-24 h-24 text-text-muted opacity-20" />
              {pass.isSoulbound && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary/20 border border-primary/40 text-xs font-medium text-primary flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Soulbound
                </div>
              )}
            </div>

            {/* Pass Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-1">{pass.name}</h3>
                <p className="text-text-muted text-sm">by {pass.creator}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Users className="w-4 h-4" />
                  <span>{pass.holders} holders</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <TrendingUp className="w-4 h-4" />
                  <span>{pass.holders}/{pass.maxSupply}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="text-sm text-text-muted mb-2">Benefits:</div>
                <ul className="space-y-1">
                  {pass.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <div className="text-text-muted text-xs">Price</div>
                  <div className="text-xl font-bold">{pass.price} ETH</div>
                </div>
                <Link href={`/passes/${pass.id}`} className="btn btn-primary">
                  Mint Pass
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPasses.length === 0 && (
        <div className="card text-center py-12">
          <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No passes found</h3>
          <p className="text-text-muted mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Be the first to create a pass!'}
          </p>
          <Link href="/passes/create" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Pass
          </Link>
        </div>
      )}
    </div>
  )
}
