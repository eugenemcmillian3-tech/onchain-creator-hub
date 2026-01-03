'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Settings, 
  Key, 
  ToggleLeft, 
  Activity, 
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { disconnect } from 'wagmi/actions'
import { formatAddress } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/config', icon: Settings, label: 'Environment Config' },
  { href: '/admin/secrets', icon: Key, label: 'Secrets Management' },
  { href: '/admin/features', icon: ToggleLeft, label: 'Feature Flags' },
  { href: '/admin/health', icon: Activity, label: 'System Health' },
  { href: '/admin/security', icon: Shield, label: 'Security' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleDisconnect = () => {
    disconnect()
    window.location.href = '/admin/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-base flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-base/20 text-base'
                  : 'text-text-muted hover:text-white hover:bg-surface-light'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-light mb-3">
          <div className="w-8 h-8 rounded-full bg-base/20 flex items-center justify-center">
            <span className="text-base text-xs font-bold">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Platform Owner</p>
            <p className="text-xs text-text-muted truncate">Admin Wallet</p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </aside>
  )
}
