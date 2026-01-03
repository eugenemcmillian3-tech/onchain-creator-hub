import prisma from '@/lib/db'
import { Activity, Server, Database, Globe, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', latency: 0, message: 'Connected' }
  } catch (error) {
    return { status: 'unhealthy', latency: 0, message: 'Connection failed' }
  }
}

async function checkRPCHealth() {
  try {
    const start = Date.now()
    const response = await fetch(process.env.BASE_RPC_URL || 'https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    })
    const latency = Date.now() - start
    
    if (response.ok) {
      return { status: 'healthy', latency, message: 'RPC responding' }
    }
    return { status: 'unhealthy', latency, message: 'RPC error' }
  } catch (error) {
    return { status: 'unhealthy', latency: 0, message: 'Connection failed' }
  }
}

async function getRecentErrors() {
  const errors = await prisma.auditLog.findMany({
    where: {
      action: 'ERROR',
    },
    orderBy: { timestamp: 'desc' },
    take: 10,
  })
  return errors
}

async function getDatabaseStats() {
  const [
    userCount,
    bountyCount,
    actionCount,
    configCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.bounty.count(),
    prisma.action.count(),
    prisma.systemConfig.count(),
  ])

  return { userCount, bountyCount, actionCount, configCount }
}

async function getRecentActivity() {
  const [actions, analytics] = await Promise.all([
    prisma.action.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.analyticsEvent.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
    }),
  ])

  return { actions, analytics }
}

export default async function HealthPage() {
  const [dbHealth, rpcHealth, errors, stats, recentActivity] = await Promise.all([
    checkDatabaseConnection(),
    checkRPCHealth(),
    getRecentErrors(),
    getDatabaseStats(),
    getRecentActivity(),
  ])

  const services = [
    {
      name: 'Database',
      ...dbHealth,
      icon: Database,
    },
    {
      name: 'Base RPC',
      ...rpcHealth,
      icon: Globe,
    },
    {
      name: 'API Server',
      status: 'healthy',
      latency: 0,
      message: 'Running',
      icon: Server,
    },
  ]

  const allHealthy = services.every(s => s.status === 'healthy')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Health</h1>
          <p className="text-text-muted">Monitor platform status and performance</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      <div className={`card ${allHealthy ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            allHealthy ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <Activity className={`w-8 h-8 ${allHealthy ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {allHealthy ? 'All Systems Operational' : 'System Issues Detected'}
            </h2>
            <p className="text-text-muted">
              {allHealthy 
                ? 'All services are running normally' 
                : 'Some services may be experiencing issues'}
            </p>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.name} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  service.status === 'healthy' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <service.icon className={`w-5 h-5 ${
                    service.status === 'healthy' ? 'text-green-500' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className={`text-sm ${
                    service.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {service.status === 'healthy' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {service.status === 'healthy' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className={service.status === 'healthy' ? 'text-green-400' : 'text-red-400'}>
                  {service.message}
                </span>
              </div>
              {service.latency > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Latency</span>
                  <span>{service.latency}ms</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Database Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Database Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats.userCount.toLocaleString()}</div>
            <div className="text-sm text-text-muted">Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats.bountyCount.toLocaleString()}</div>
            <div className="text-sm text-text-muted">Bounties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats.actionCount.toLocaleString()}</div>
            <div className="text-sm text-text-muted">Actions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats.configCount.toLocaleString()}</div>
            <div className="text-sm text-text-muted">Configs</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Actions</h2>
          <div className="space-y-3">
            {recentActivity.actions.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No recent actions</p>
            ) : (
              recentActivity.actions.map((action) => (
                <div key={action.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-xs">
                      {action.type.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm">{action.type}</p>
                      <p className="text-xs text-text-muted">
                        {formatRelativeTime(action.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${Number(action.amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Analytics */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Analytics Events</h2>
          <div className="space-y-3">
            {recentActivity.analytics.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No recent events</p>
            ) : (
              recentActivity.analytics.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm">{event.eventType}</p>
                      <p className="text-xs text-text-muted">
                        {formatRelativeTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                  {event.amount && (
                    <span className="text-sm font-medium">${Number(event.amount).toFixed(2)}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Logs */}
      {errors.length > 0 && (
        <div className="card border-red-500/30">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Recent Errors
          </h2>
          <div className="space-y-3">
            {errors.map((error) => (
              <div key={error.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-sm">{error.resource}</code>
                  <span className="text-xs text-text-muted">
                    {formatRelativeTime(error.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-text-muted">{error.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
