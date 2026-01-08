'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, Clock, DollarSign, Users, Search, Filter, Plus } from 'lucide-react'

export default function BountiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'completed'>('all')

  const mockBounties = [
    {
      id: '1',
      title: 'Build Farcaster Frame for NFT Collection',
      description: 'Create an interactive frame that showcases our NFT collection with mint functionality',
      amount: 500,
      currency: 'USDC',
      status: 'open',
      deadline: '2025-01-15',
      applicants: 3,
      poster: '0x123...abc',
    },
    {
      id: '2',
      title: 'Design Landing Page for DeFi Protocol',
      description: 'Modern, clean design for a new DeFi protocol launching on Base',
      amount: 750,
      currency: 'USDC',
      status: 'in-progress',
      deadline: '2025-01-20',
      applicants: 5,
      poster: '0x456...def',
    },
    {
      id: '3',
      title: 'Write Technical Documentation',
      description: 'Comprehensive docs for smart contract integration',
      amount: 300,
      currency: 'USDC',
      status: 'open',
      deadline: '2025-01-18',
      applicants: 2,
      poster: '0x789...ghi',
    },
  ]

  const filteredBounties = mockBounties.filter(bounty => {
    const matchesSearch = bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bounty.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || bounty.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400 bg-green-400/10'
      case 'in-progress': return 'text-yellow-400 bg-yellow-400/10'
      case 'completed': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Bounties</h1>
        <p className="text-text-muted max-w-2xl">
          Discover opportunities or post bounties for your projects. All payments are securely escrowed on-chain.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search bounties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <Link href="/bounties/create" className="btn btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Post Bounty
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Total Bounties</div>
          <div className="text-2xl font-bold">{mockBounties.length}</div>
        </div>
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Total Value</div>
          <div className="text-2xl font-bold">${mockBounties.reduce((acc, b) => acc + b.amount, 0)}</div>
        </div>
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Open Bounties</div>
          <div className="text-2xl font-bold">{mockBounties.filter(b => b.status === 'open').length}</div>
        </div>
        <div className="card">
          <div className="text-text-muted text-sm mb-1">Total Applicants</div>
          <div className="text-2xl font-bold">{mockBounties.reduce((acc, b) => acc + b.applicants, 0)}</div>
        </div>
      </div>

      {/* Bounties List */}
      <div className="space-y-4">
        {filteredBounties.map((bounty) => (
          <div key={bounty.id} className="card hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{bounty.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bounty.status)}`}>
                    {bounty.status}
                  </span>
                </div>
                <p className="text-text-muted mb-4">{bounty.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-green-400">{bounty.amount} {bounty.currency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="w-4 h-4" />
                    <span>Due {bounty.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Users className="w-4 h-4" />
                    <span>{bounty.applicants} applicants</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Target className="w-4 h-4" />
                    <span>Posted by {bounty.poster}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2">
                <Link href={`/bounties/${bounty.id}`} className="btn btn-primary">
                  View Details
                </Link>
                {bounty.status === 'open' && (
                  <button className="btn btn-secondary">
                    Apply
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredBounties.length === 0 && (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bounties found</h3>
            <p className="text-text-muted mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Be the first to post a bounty!'}
            </p>
            <Link href="/bounties/create" className="btn btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Post Bounty
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
