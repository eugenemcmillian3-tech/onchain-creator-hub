import prisma from '@/lib/db'
import { Activity, DollarSign, Users, TrendingUp, Server, AlertTriangle } from 'lucide-react'
import { formatUSD, formatRelativeTime } from '@/lib/utils'

async function getStats() {
  const [
    totalUsers,
    totalBounties,
    totalVolume,
    recentActions,
    systemConfigs,
    featureFlags,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.bounty.count(),
    prisma.action.aggregate({
      _sum: { amount: true },
    }),
    prisma.action.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.systemConfig.count(),
    prisma.featureFlag.count({ where: { enabled: false } }),
  ])

  return {
    totalUsers,
    totalBounties,
    totalVolume: totalVolume._sum.amount || 0,
    recentActions,
    systemConfigs,
    disabledFeatures: featureFlags,
  }
}

async function getRecentActivity() {
  const [actions, bounties, analytics] = await Promise.all([
    prisma.action.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    prisma.bounty.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { poster: true },
    }),
    prisma.analyticsEvent.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
    }),
  ])

  return { actions, bounties, analytics }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const { actions, bounties, analytics } = await getRecentActivity()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-muted">Platform overview and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="badge-success">Active</span>
          </div>
          <div className="stat-value mt-4">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="stat-value mt-4">{formatUSD(stats.totalVolume)}</div>
          <div className="stat-label">Total Volume</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="stat-value mt-4">{stats.totalBounties.toLocaleString()}</div>
          <div className="stat-label">Total Bounties</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="stat-value mt-4">{stats.recentActions.toLocaleString()}</div>
          <div className="stat-label">Actions (24h)</div>
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/config" className="card-hover text-center py-4">
              <Settings className="w-8 h-8 mx-auto mb-2 text-base" />
              <p className="font-medium">Config</p>
            </a>
            <a href="/admin/secrets" className="card-hover text-center py-4">
              <Server className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Secrets</p>
            </a>
            <a href="/admin/features" className="card-hover text-center py-4">
              <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="font-medium">Features</p>
            </a>
            <a href="/admin/security" className="card-hover text-center py-4">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="font-medium">Security</p>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-muted">Environment Config</span>
              <span className="badge-success">{stats.systemConfigs} variables</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-muted">Feature Flags</span>
              <span className={stats.disabledFeatures > 0 ? 'badge-warning' : 'badge-success'}>
                {stats.disabledFeatures} disabled
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-muted">Database</span>
              <span className="badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-muted">Base RPC</span>
              <span className="badge-success">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Actions</h2>
          <div className="space-y-3">
            {actions.length === 0 ? (
              <p className="text-text-muted text-sm">No recent actions</p>
            ) : (
              actions.map((action) => (
                <div key={action.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-xs">
                    {action.type.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{action.type}</p>
                    <p className="text-xs text-text-muted">
                      {formatRelativeTime(action.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatUSD(action.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bounties */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Bounties</h2>
          <div className="space-y-3">
            {bounties.length === 0 ? (
              <p className="text-text-muted text-sm">No recent bounties</p>
            ) : (
              bounties.map((bounty) => (
                <div key={bounty.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    bounty.status === 'OPEN' ? 'bg-green-500/20 text-green-500' :
                    bounty.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {bounty.status.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{bounty.title}</p>
                    <p className="text-xs text-text-muted">
                      {formatRelativeTime(bounty.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatUSD(bounty.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Events */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Analytics Events</h2>
          <div className="space-y-3">
            {analytics.length === 0 ? (
              <p className="text-text-muted text-sm">No recent events</p>
            ) : (
              analytics.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{event.eventType}</p>
                    <p className="text-xs text-text-muted">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                  {event.amount && (
                    <span className="text-sm font-medium">{formatUSD(Number(event.amount))}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
