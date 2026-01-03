'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Save, Trash2, RefreshCw, AlertCircle, CheckCircle, Shield } from 'lucide-react'

interface Secret {
  id: string
  key: string
  masked: string
  description: string
  updatedAt: string
  updatedBy: string | null
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rotating, setRotating] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSecret, setNewSecret] = useState({ key: '', value: '', description: '' })

  useEffect(() => {
    loadSecrets()
  }, [])

  const loadSecrets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/secrets')
      if (response.ok) {
        const data = await response.json()
        setSecrets(data.secrets || [])
      }
    } catch (error) {
      console.error('Failed to load secrets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSecret = async () => {
    if (!newSecret.key || !newSecret.value) {
      setMessage({ type: 'error', text: 'Key and value are required' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSecret),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Secret added successfully!' })
        setNewSecret({ key: '', value: '', description: '' })
        setShowAddModal(false)
        loadSecrets()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to add secret' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add secret' })
    } finally {
      setSaving(false)
    }
  }

  const handleRotate = async (key: string) => {
    setRotating(key)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/secrets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, action: 'rotate' }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Secret rotated successfully!' })
        loadSecrets()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to rotate secret' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to rotate secret' })
    } finally {
      setRotating(null)
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete ${key}? This action cannot be undone.`)) {
      return
    }

    setMessage(null)

    try {
      const response = await fetch('/api/admin/secrets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Secret deleted successfully!' })
        loadSecrets()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to delete secret' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete secret' })
    }
  }

  const commonSecrets = [
    { key: 'NEYNAR_API_KEY', description: 'Neynar API key for Farthercast integration' },
    { key: 'OPENROUTER_API_KEY', description: 'OpenRouter API key for AI features' },
    { key: 'BASESCAN_API_KEY', description: 'Basescan API key for contract verification' },
    { key: 'POSTHOG_API_KEY', description: 'PostHog API key for analytics' },
    { key: 'ALCHEMY_API_KEY', description: 'Alchemy API key for enhanced RPC' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Secrets Management</h1>
          <p className="text-text-muted">Rotate and manage API keys and sensitive credentials</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Secret
        </button>
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

      {/* Security Notice */}
      <div className="card bg-green-500/10 border-green-500/30">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Encryption at Rest</h3>
            <p className="text-sm text-text-muted">
              All secrets are encrypted using AES-256 encryption before storage. 
              The encryption key is stored in environment variables and never exposed to the frontend.
              Secrets are masked by default and can only be viewed in secure admin sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Secrets List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Stored Secrets</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-base" />
            <p className="text-text-muted">Loading secrets...</p>
          </div>
        ) : secrets.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
            <p className="text-text-muted mb-4">No secrets stored yet</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Add Your First Secret
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Description</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {secrets.map((secret) => (
                  <tr key={secret.id}>
                    <td>
                      <code className="text-sm bg-surface-light px-2 py-1 rounded">
                        {secret.key}
                      </code>
                    </td>
                    <td>
                      <code className="text-sm text-text-muted">
                        {secret.masked}
                      </code>
                    </td>
                    <td className="text-text-muted text-sm">{secret.description}</td>
                    <td className="text-text-muted text-sm">
                      {new Date(secret.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRotate(secret.key)}
                          disabled={rotating === secret.key}
                          className="btn-ghost p-2 text-sm flex items-center gap-1"
                        >
                          <RefreshCw className={`w-4 h-4 ${rotating === secret.key ? 'animate-spin' : ''}`} />
                          Rotate
                        </button>
                        <button
                          onClick={() => handleDelete(secret.key)}
                          className="btn-ghost p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Add */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Add Common Secrets</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonSecrets.map((secret) => (
            <button
              key={secret.key}
              onClick={() => {
                setNewSecret({ ...newSecret, key: secret.key, description: secret.description })
                setShowAddModal(true)
              }}
              className="card-hover text-left p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-base" />
                <code className="text-sm">{secret.key}</code>
              </div>
              <p className="text-xs text-text-muted">{secret.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add New Secret</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key</label>
                <input
                  type="text"
                  value={newSecret.key}
                  onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value })}
                  className="input"
                  placeholder="e.g., NEYNAR_API_KEY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <textarea
                  value={newSecret.value}
                  onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Enter the secret value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newSecret.description}
                  onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
                  className="input"
                  placeholder="What is this secret for?"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSecret}
                disabled={saving || !newSecret.key || !newSecret.value}
                className="btn btn-primary flex-1"
              >
                {saving ? 'Adding...' : 'Add Secret'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
