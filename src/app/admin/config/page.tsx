'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface ConfigItem {
  key: string
  value: string
  description: string
  category: string
  sensitive: boolean
}

const defaultConfigs: ConfigItem[] = [
  // Database
  { key: 'DATABASE_URL', value: '', description: 'PostgreSQL connection string', category: 'Database', sensitive: true },
  
  // Authentication
  { key: 'NEXTAUTH_SECRET', value: '', description: 'NextAuth secret for session encryption', category: 'Authentication', sensitive: true },
  
  // Blockchain
  { key: 'BASE_RPC_URL', value: 'https://mainnet.base.org', description: 'Base mainnet RPC endpoint', category: 'Blockchain', sensitive: false },
  { key: 'BASESCAN_API_KEY', value: '', description: 'Basescan API key for contract verification', category: 'Blockchain', sensitive: true },
  
  // Neynar
  { key: 'NEYNAR_API_KEY', value: '', description: 'Neynar API key for Farthercast integration', category: 'Integration', sensitive: true },
  { key: 'NEYNAR_SECRET_KEY', value: '', description: 'Neynar secret key', category: 'Integration', sensitive: true },
  
  // OpenRouter
  { key: 'OPENROUTER_API_KEY', value: '', description: 'OpenRouter API key for AI features', category: 'Integration', sensitive: true },
  
  // Contracts
  { key: 'SUBSCRIPTION_MANAGER_ADDRESS', value: '', description: 'SubscriptionManager contract address', category: 'Contracts', sensitive: false },
  { key: 'FEE_CONFIG_ADDRESS', value: '', description: 'FeeConfig contract address', category: 'Contracts', sensitive: false },
  { key: 'ACTION_PROCESSOR_ADDRESS', value: '', description: 'ActionProcessor contract address', category: 'Contracts', sensitive: false },
  { key: 'ACCESS_PASS_FACTORY_ADDRESS', value: '', description: 'AccessPassFactory contract address', category: 'Contracts', sensitive: false },
  { key: 'BOUNTY_ESCROW_ADDRESS', value: '', description: 'BountyEscrow contract address', category: 'Contracts', sensitive: false },
  
  // Feature Flags
  { key: 'ENABLE_MAINTENANCE_MODE', value: 'false', description: 'Enable maintenance mode', category: 'Features', sensitive: false },
  { key: 'ENABLE_NEW_BOUNTIES', value: 'true', description: 'Allow new bounty creation', category: 'Features', sensitive: false },
  { key: 'ENABLE_PASS_MINTING', value: 'true', description: 'Allow pass minting', category: 'Features', sensitive: false },
  
  // Analytics
  { key: 'POSTHOG_API_KEY', value: '', description: 'PostHog API key for analytics', category: 'Analytics', sensitive: true },
]

const categories = ['Database', 'Authentication', 'Blockchain', 'Integration', 'Contracts', 'Features', 'Analytics']

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>(defaultConfigs)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filter, setFilter] = useState('all')
  const [showValues, setShowValues] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/config')
      if (response.ok) {
        const data = await response.json()
        // Merge with defaults
        const merged = defaultConfigs.map(defaultConfig => {
          const serverConfig = data.configs?.find((c: any) => c.key === defaultConfig.key)
          if (serverConfig) {
            return { ...defaultConfig, value: serverConfig.value || '' }
          }
          return defaultConfig
        })
        setConfigs(merged)
      }
    } catch (error) {
      console.error('Failed to load configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configs: configs.filter(c => c.value !== defaultConfigs.find(d => d.key === c.key)?.value)
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' })
        loadConfigs()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c))
  }

  const toggleShowValue = (key: string) => {
    setShowValues(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const filteredConfigs = filter === 'all' 
    ? configs 
    : configs.filter(c => c.category === filter)

  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = []
    }
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, ConfigItem[]>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Environment Configuration</h1>
          <p className="text-text-muted">Manage platform environment variables</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadConfigs} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border-green-500/30 text-green-400'
            : 'bg-red-500/20 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'all' ? 'bg-base text-white' : 'bg-surface text-text-muted hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === category ? 'bg-base text-white' : 'bg-surface text-text-muted hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Config Groups */}
      {loading ? (
        <div className="card text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-base" />
          <p className="text-text-muted">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
            <div key={category} className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-base" />
                {category}
              </h2>
              <div className="space-y-4">
                {categoryConfigs.map(config => (
                  <div key={config.key} className="grid md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium mb-1">{config.key}</label>
                      <p className="text-xs text-text-muted">{config.description}</p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="relative">
                        <input
                          type={config.sensitive && !showValues.has(config.key) ? 'password' : 'text'}
                          value={config.value}
                          onChange={(e) => handleChange(config.key, e.target.value)}
                          className="input pr-10"
                          placeholder={`Enter ${config.key}`}
                        />
                        {config.sensitive && (
                          <button
                            type="button"
                            onClick={() => toggleShowValue(config.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                          >
                            {showValues.has(config.key) ? (
                              <span className="text-xs">Hide</span>
                            ) : (
                              <span className="text-xs">Show</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-500/10 border-blue-500/30">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          Important Notes
        </h3>
        <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
          <li>Changes to sensitive values (API keys, secrets) require full redeployment</li>
          <li>Contract addresses must be correct or functionality will be impaired</li>
          <li>Always test configuration changes in a testnet environment first</li>
          <li>Database URL changes require database migration</li>
        </ul>
      </div>
    </div>
  )
}
