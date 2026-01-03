import prisma from '@/lib/db'
import { Shield, Key, Fingerprint, Activity, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

async function getSecurityStats() {
  const [
    totalAuditLogs,
    recentErrors,
    configCount,
    adminUsers,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      where: { action: { contains: 'ERROR' } },
      take: 10,
      orderBy: { timestamp: 'desc' },
    }),
    prisma.systemConfig.count({ where: { isSecret: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ])

  return {
    totalAuditLogs,
    secretCount: configCount,
    adminCount: adminUsers,
    recentErrors,
  }
}

async function getRecentAuditLogs() {
  return prisma.auditLog.findMany({
    take: 20,
    orderBy: { timestamp: 'desc' },
    include: { user: true },
  })
}

export default async function SecurityPage() {
  const stats = await getSecurityStats()
  const auditLogs = await getRecentAuditLogs()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Security</h1>
        <p className="text-text-muted">Monitor security events and access logs</p>
      </div>

      {/* Security Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.adminCount}</p>
              <p className="text-sm text-text-muted">Admins</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.secretCount}</p>
              <p className="text-sm text-text-muted">Encrypted Secrets</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAuditLogs}</p>
              <p className="text-sm text-text-muted">Audit Events</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.recentErrors.length}</p>
              <p className="text-sm text-text-muted">Recent Errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Security Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">AES-256 Encryption</h3>
              <p className="text-sm text-text-muted">All secrets are encrypted at rest</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">SIWE Authentication</h3>
              <p className="text-sm text-text-muted">Wallet-based signature verification</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Role-Based Access</h3>
              <p className="text-sm text-text-muted">Admin-only routes with middleware</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Audit Logging</h3>
              <p className="text-sm text-text-muted">All actions are logged and traceable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {stats.recentErrors.length > 0 && (
        <div className="card border-red-500/30">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Recent Errors
          </h2>
          <div className="space-y-3">
            {stats.recentErrors.map((error) => (
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

      {/* Audit Log */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Audit Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-text-muted border-b border-border">
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Resource</th>
                <th className="pb-3 font-medium">User</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 text-sm text-text-muted">
                    {formatRelativeTime(log.timestamp)}
                  </td>
                  <td className="py-3">
                    <span className={`text-sm px-2 py-1 rounded ${
                      log.action.includes('ERROR') 
                        ? 'bg-red-500/20 text-red-400' 
                        : log.action.includes('SECRET')
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-text-muted">{log.resource}</td>
                  <td className="py-3 text-sm font-mono text-text-muted">
                    {log.userId ? log.userId.slice(0, 8) + '...' : 'System'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
