'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, DollarSign, Users, Activity, ArrowUp, ArrowDown } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const stats = [
    { label: 'Total Earnings', value: '$12,450', change: '+12.5%', trend: 'up', icon: DollarSign },
    { label: 'Active Bounties', value: '8', change: '+2', trend: 'up', icon: Activity },
    { label: 'Pass Holders', value: '245', change: '+18', trend: 'up', icon: Users },
    { label: 'Total Actions', value: '1,234', change: '-5%', trend: 'down', icon: BarChart3 },
  ]

  const recentActivity = [
    { type: 'bounty_paid', amount: 500, description: 'Bounty completed: Frame Development', date: '2 hours ago' },
    { type: 'pass_minted', amount: 0.05, description: 'New pass holder: Creator Pro', date: '5 hours ago' },
    { type: 'tip_received', amount: 10, description: 'Tip from 0x123...abc', date: '1 day ago' },
    { type: 'content_unlocked', amount: 5, description: 'Content unlock payment', date: '1 day ago' },
    { type: 'bounty_posted', amount: -750, description: 'Posted new bounty', date: '2 days ago' },
  ]

  const topPerformers = [
    { name: 'Creator Pro Pass', revenue: 2450, holders: 89, trend: '+15%' },
    { name: 'Frame Development Bounty', revenue: 1500, completions: 3, trend: '+8%' },
    { name: 'Premium Content Bundle', revenue: 980, unlocks: 156, trend: '+22%' },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
        <p className="text-text-muted max-w-2xl">
          Track your earnings, engagement, and performance across all features.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted hover:bg-surface-light'
            }`}
          >
            {range === 'all' ? 'All Time' : range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-text-muted text-sm mb-1">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Revenue Overview</h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="h-64 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t cursor-pointer"
                  style={{ height: `${height}%` }}
                />
                {index % 2 === 0 && (
                  <span className="text-xs text-text-muted mt-2">
                    {new Date(Date.now() - (11 - index) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm">
            <div>
              <span className="text-text-muted">Total Revenue: </span>
              <span className="font-semibold">$12,450</span>
            </div>
            <div>
              <span className="text-text-muted">Avg per day: </span>
              <span className="font-semibold">$415</span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((item, index) => (
              <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-green-400 text-xs font-medium">{item.trend}</div>
                </div>
                <div className="text-2xl font-bold mb-1">${item.revenue}</div>
                <div className="text-text-muted text-xs">
                  {'holders' in item ? `${item.holders} holders` : 
                   'completions' in item ? `${item.completions} completions` :
                   `${item.unlocks} unlocks`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const isPositive = activity.amount > 0
            return (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPositive ? 'bg-green-400/20 text-green-400' : 'bg-blue-400/20 text-blue-400'
                }`}>
                  {isPositive ? <ArrowUp className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">{activity.description}</div>
                  <div className="text-sm text-text-muted">{activity.date}</div>
                </div>
                <div className={`font-bold ${isPositive ? 'text-green-400' : 'text-text-muted'}`}>
                  {isPositive ? '+' : ''}{activity.amount > 0 ? `$${activity.amount}` : `${activity.amount}`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="card bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/30 text-center mt-8">
        <h3 className="text-2xl font-bold mb-2">Unlock Advanced Analytics</h3>
        <p className="text-text-muted mb-6 max-w-xl mx-auto">
          Upgrade to Pro or Power tier for detailed insights, custom reports, and API access.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn btn-primary">Upgrade Now</button>
          <button className="btn btn-secondary">Learn More</button>
        </div>
      </div>
    </div>
  )
}
