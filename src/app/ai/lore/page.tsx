'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { isAdminWallet } from '@/lib/wallet-detector'

export default function LoreGeneratorPage() {
  const { address, isConnected } = useAccount()
  const [prompt, setPrompt] = useState('')
  const [lore, setLore] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isAdmin = address ? isAdminWallet(address) : false
  const price = 1.50

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setLore('')

    try {
      const response = await fetch('/api/ai/lore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          walletAddress: address,
          chain: 'base',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setLore(data.lore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lore')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(lore)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">AI Lore Generator</h1>
        <p className="text-text-muted max-w-2xl mx-auto mb-4">
          Generate compelling lore and backstories for your projects, characters, or worlds using AI.
        </p>
        <div className="flex items-center justify-center gap-2 text-lg">
          <span className="text-text-muted">Price:</span>
          {isAdmin ? (
            <span className="font-bold text-primary">FREE (Admin Access)</span>
          ) : (
            <span className="font-bold text-primary">${price} per generation</span>
          )}
        </div>
      </div>

      {/* Generator Form */}
      <div className="card mb-6">
        <label className="block text-sm font-medium mb-2">
          Describe what you want to generate lore for:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: A mystical realm where creators wield the power of onchain stories..."
          className="w-full h-32 px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none mb-4"
          disabled={loading}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Lore {!isAdmin && `($${price})`}
            </>
          )}
        </button>

        {!isConnected && (
          <p className="text-sm text-text-muted text-center mt-4">
            Please connect your wallet to use this feature
          </p>
        )}
      </div>

      {/* Generated Lore */}
      {lore && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Generated Lore</h3>
            <button
              onClick={copyToClipboard}
              className="btn btn-secondary flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-text-muted leading-relaxed">
              {lore}
            </p>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="card bg-surface-light mt-6">
        <h3 className="font-semibold mb-3">Example Prompts:</h3>
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setPrompt('A legendary sword forged in the fires of Mount Doom')}
            className="block w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            → A legendary sword forged in the fires of Mount Doom
          </button>
          <button
            onClick={() => setPrompt('An ancient library that contains all the knowledge of the multiverse')}
            className="block w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            → An ancient library that contains all the knowledge of the multiverse
          </button>
          <button
            onClick={() => setPrompt('A mysterious figure who guards the gateway between dimensions')}
            className="block w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            → A mysterious figure who guards the gateway between dimensions
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="card text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-semibold mb-1">Fast Generation</div>
          <div className="text-sm text-text-muted">Results in seconds</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">🎨</div>
          <div className="font-semibold mb-1">Creative Output</div>
          <div className="text-sm text-text-muted">Unique every time</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold mb-1">Fair Pricing</div>
          <div className="text-sm text-text-muted">${price} per generation</div>
        </div>
      </div>
    </div>
  )
}
