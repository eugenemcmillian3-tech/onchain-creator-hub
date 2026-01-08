'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Wallet, TrendingUp, Target, Ticket, BarChart3, 
  Plus, ArrowRight, Sparkles, Megaphone, DollarSign 
} from 'lucide-react'
import { isAdminWallet, detectSource } from '@/lib/wallet-detector'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [source, setSource] = useState<'farcaster' | 'base-app' | 'direct'>('direct')

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
    if (address) {
      setIsAdmin(isAdminWallet(address))
    }
    setSource(detectSource())
  }, [isConnected, address, router])

  const quickStats = [
    { label: 'Total Earnings', value: '$2,450', icon: DollarSign, color: 'text-green-400' },
    { label: 'Active Bounties', value: '3', icon: Target, color: 'text-blue-400' },
    { label: 'Pass Holders', value: '89', icon: Ticket, color: 'text-purple-400' },
    { label: 'This Month', value: '+$450', icon: TrendingUp, color: 'text-primary' },
  ]

  const quickActions = [
    { label: 'Post Bounty', href: '/bounties/create', icon: Plus, color: 'bg-blue-500' },
    { label: 'Create Pass', href: '/passes/create', icon: Ticket, color: 'bg-purple-500' },
    { label: 'Generate Lore', href: '/ai/lore', icon: Sparkles, color: 'bg-primary' },
    { label: 'Create Promo', href: '/ai/promo', icon: Megaphone, color: 'bg-orange-500' },
  ]

  const recentActivity = [
    { type: 'Bounty Completed', amount: '+$500', time: '2 hours ago', status: 'success' },
    { type: 'Pass Minted', amount: '+0.05 ETH', time: '5 hours ago', status: 'success' },
    { type: 'Tip Received', amount: '+$10', time: '1 day ago', status: 'success' },
  ]

  if (!isConnected) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-text-muted">
              Welcome back! {isAdmin && <span className="text-primary">Admin Access Enabled</span>}
            </p>
          </div>
          {isAdmin && (
            <Link href="/admin" className="btn btn-primary flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
        </div>

        {/* Connection Info */}
        <div className="card bg-surface-light">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Connected Wallet</div>
              <div className="text-sm text-text-muted font-mono">{address}</div>
            </div>
            {source !== 'direct' && (
              <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                via {source === 'farcaster' ? 'Farcaster' : 'Base App'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-text-muted text-sm">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            const isPaid = action.label.includes('Lore') || action.label.includes('Promo')
            const price = action.label.includes('Lore') ? '$1.50' : action.label.includes('Promo') ? '$2.50' : null
            
            return (
              <Link
                key={action.label}
                href={action.href}
                className="card hover:border-primary/50 transition-all text-center"
              >
                <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold mb-1">{action.label}</div>
                {isPaid && (
                  <div className="text-sm text-text-muted">
                    {price} {isAdmin && <span className="text-primary">(Free for you!)</span>}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Link href="/analytics" className="text-primary hover:underline flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div>
                    <div className="font-semibold mb-1">{activity.type}</div>
                    <div className="text-sm text-text-muted">{activity.time}</div>
                  </div>
                  <div className="text-green-400 font-bold">{activity.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="card space-y-3">
            <Link href="/bounties" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors">
              <span>My Bounties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/passes" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors">
              <span>My Passes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/analytics" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors">
              <span>Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors">
              <span>Upgrade Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* AI Features Card */}
          {isAdmin && (
            <div className="card bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30 mt-4">
              <Sparkles className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">AI Features</h3>
              <p className="text-sm text-text-muted mb-4">
                As an admin, you have free access to all AI features!
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/ai/lore" className="btn btn-primary text-sm">
                  Generate Lore
                </Link>
                <Link href="/ai/promo" className="btn btn-secondary text-sm">
                  Create Promo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Banner (if not admin) */}
      {!isAdmin && (
        <div className="card bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/30 text-center mt-8">
          <h3 className="text-2xl font-bold mb-2">Unlock Your Full Potential</h3>
          <p className="text-text-muted mb-6 max-w-xl mx-auto">
            Upgrade to Pro or Power tier for advanced analytics, higher limits, and exclusive features.
          </p>
          <Link href="/pricing" className="btn btn-primary">
            View Plans
          </Link>
        </div>
      )}
    </div>
  )
}
