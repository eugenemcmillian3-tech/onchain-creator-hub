'use client'

import { useState, useEffect } from 'react'
import { ToggleLeft, ToggleRight, Save, RefreshCw, AlertCircle, CheckCircle, Activity } from 'lucide-react'

interface FeatureFlag {
  key: string
  enabled: boolean
  description: string
  metadata: {
    category?: string
    owner?: string
    lastModified?: string
  }
}

const defaultFlags: FeatureFlag[] = [
  {
    key: 'ENABLE_MAINTENANCE_MODE',
    enabled: false,
    description: 'Enable maintenance mode - blocks all non-admin access',
    metadata: { category: 'System' },
  },
  {
    key: 'ENABLE_NEW_BOUNTIES',
    enabled: true,
    description: 'Allow users to create new bounties',
    metadata: { category: 'Features' },
  },
  {
    key: 'ENABLE_PASS_MINTING',
    enabled: true,
    description: 'Allow users to mint access passes',
    metadata: { category: 'Features' },
  },
  {
    key: 'ENABLE_SUBSCRIPTIONS',
    enabled: true,
    description: 'Enable subscription system',
    metadata: { category: 'Monetization' },
  },
  {
    key: 'ENABLE_PAY_PER_USE',
    enabled: true,
    description: 'Enable pay-per-use model for non-subscribers',
    metadata: { category: 'Monetization' },
  },
  {
    key: 'ENABLE_ANALYTICS',
    enabled: true,
    description: 'Enable analytics tracking and dashboard',
    metadata: { category: 'Features' },
  },
  {
    key: 'ENABLE_FRAME_VALIDATION',
    enabled: true,
    description: 'Validate Farthercast frame actions via Neynar',
    metadata: { category: 'Integration' },
  },
  {
    key: 'ENABLE_RATE_LIMITING',
    enabled: true,
    description: 'Enable API rate limiting',
    metadata: { category: 'Security' },
  },
]

export default function FeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadFlags()
  }, [])

  const loadFlags = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/features')
      if (response.ok) {
        const data = await response.json()
        if (data.flags && data.flags.length > 0) {
          // Merge with defaults
          const merged = defaultFlags.map(defaultFlag => {
            const serverFlag = data.flags.find((f: any) => f.key === defaultFlag.key)
            if (serverFlag) {
              return { ...defaultFlag, enabled: serverFlag.enabled }
            }
            return defaultFlag
          })
          setFlags(merged)
        }
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: string) => {
    setFlags(prev => prev.map(flag => 
      flag.key === key ? { ...flag, enabled: !flag.enabled } : flag
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flags: flags.map(f => ({ key: f.key, enabled: f.enabled }))
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Feature flags updated successfully!' })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update feature flags' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update feature flags' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Reset all feature flags to defaults?')) {
      setFlags(defaultFlags)
    }
  }

  const categories = ['all', ...Array.from(new Set(defaultFlags.map(f => f.metadata.category || 'Other')))]

  const filteredFlags = filter === 'all' 
    ? flags 
    : flags.filter(f => (f.metadata.category || 'Other') === filter)

  const enabledCount = flags.filter(f => f.enabled).length
  const disabledCount = flags.length - enabledCount

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Feature Flags</h1>
          <p className="text-text-muted">Control platform features and kill switches</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-white mb-1">{flags.length}</div>
          <div className="text-sm text-text-muted">Total Flags</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-500 mb-1">{enabledCount}</div>
          <div className="text-sm text-text-muted">Enabled</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-500 mb-1">{disabledCount}</div>
          <div className="text-sm text-text-muted">Disabled</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === category ? 'bg-base text-white' : 'bg-surface text-text-muted hover:text-white'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Feature List */}
      {loading ? (
        <div className="card text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-base" />
          <p className="text-text-muted">Loading feature flags...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlags.map((flag) => (
            <div key={flag.key} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(flag.key)}
                    className={`mt-1 ${flag.enabled ? 'text-green-500' : 'text-text-muted'}`}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                  <div>
                    <code className="text-sm bg-surface-light px-2 py-1 rounded">
                      {flag.key}
                    </code>
                    <p className="text-text-muted text-sm mt-1">{flag.description}</p>
                    {flag.metadata.category && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-surface-light text-text-muted">
                        {flag.metadata.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  flag.enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {flag.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kill Switch Warning */}
      <div className="card bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-start gap-4">
          <Activity className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Kill Switches</h3>
            <p className="text-sm text-text-muted mb-2">
              Some feature flags serve as kill switches. Disabling critical features may impact 
              user experience and platform functionality.
            </p>
            <ul className="text-sm text-text-muted list-disc list-inside space-y-1">
              <li><strong>ENABLE_MAINTENANCE_MODE</strong> - Blocks all non-admin access</li>
              <li><strong>ENABLE_NEW_BOUNTIES</strong> - Prevents new bounty creation</li>
              <li><strong>ENABLE_PASS_MINTING</strong> - Stops access pass minting</li>
              <li><strong>ENABLE_RATE_LIMITING</strong> - Disables API rate limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
