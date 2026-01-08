'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Megaphone, Loader2, Copy, Check, Hash } from 'lucide-react'
import { isAdminWallet } from '@/lib/wallet-detector'

export default function PromoGeneratorPage() {
  const { address, isConnected } = useAccount()
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [promo, setPromo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isAdmin = address ? isAdminWallet(address) : false
  const price = 2.50

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError('Please enter a product name')
      return
    }

    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setPromo(null)

    try {
      const response = await fetch('/api/ai/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          description,
          walletAddress: address,
          chain: 'base',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setPromo(data.promo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate promo')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    const text = `${promo.title}\n\n${promo.description}\n\n${promo.hashtags.join(' ')}\n\n${promo.callToAction}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">AI Promo Pack Generator</h1>
        <p className="text-text-muted max-w-2xl mx-auto mb-4">
          Create professional promotional content including title, description, hashtags, and call-to-action.
        </p>
        <div className="flex items-center justify-center gap-2 text-lg">
          <span className="text-text-muted">Price:</span>
          {isAdmin ? (
            <span className="font-bold text-primary">FREE (Admin Access)</span>
          ) : (
            <span className="font-bold text-orange-500">${price} per generation</span>
          )}
        </div>
      </div>

      {/* Generator Form */}
      <div className="card mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product/Service Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Creator NFT Collection"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about your product..."
              className="w-full h-24 px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !productName.trim()}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Megaphone className="w-5 h-5" />
                Generate Promo Pack {!isAdmin && `($${price})`}
              </>
            )}
          </button>

          {!isConnected && (
            <p className="text-sm text-text-muted text-center">
              Please connect your wallet to use this feature
            </p>
          )}
        </div>
      </div>

      {/* Generated Promo */}
      {promo && (
        <div className="space-y-4 animate-fade-in">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Generated Promo Pack</h3>
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
                    Copy All
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <div className="text-sm text-text-muted mb-2">Title</div>
                <h2 className="text-2xl font-bold">{promo.title}</h2>
              </div>

              {/* Description */}
              <div>
                <div className="text-sm text-text-muted mb-2">Description</div>
                <p className="text-text-muted leading-relaxed">{promo.description}</p>
              </div>

              {/* Hashtags */}
              <div>
                <div className="text-sm text-text-muted mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags
                </div>
                <div className="flex flex-wrap gap-2">
                  {promo.hashtags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div>
                <div className="text-sm text-text-muted mb-2">Call to Action</div>
                <p className="text-lg font-semibold text-primary">{promo.callToAction}</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30">
            <div className="text-sm text-text-muted mb-2">Social Media Preview</div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold">{promo.title}</h3>
              <p className="text-sm">{promo.description}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {promo.hashtags.map((tag: string, index: number) => (
                  <span key={index} className="text-primary">{tag}</span>
                ))}
              </div>
              <p className="font-semibold text-primary">{promo.callToAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="card bg-surface-light mt-6">
        <h3 className="font-semibold mb-3">Example Products:</h3>
        <div className="space-y-2 text-sm">
          <button
            onClick={() => {
              setProductName('Creator Pass NFT')
              setDescription('Exclusive access to creator content and community')
            }}
            className="block w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            → Creator Pass NFT Collection
          </button>
          <button
            onClick={() => {
              setProductName('DeFi Yield Protocol')
              setDescription('Maximize your crypto yields with automated strategies')
            }}
            className="block w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            → DeFi Yield Protocol Launch
          </button>
          <button
            onClick={() => {
              setProductName('Web3 Learning Platform')
              setDescription('Learn blockchain development with interactive courses')
            }}
            className="block w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            → Web3 Learning Platform
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="card text-center">
          <div className="text-2xl mb-2">📝</div>
          <div className="font-semibold mb-1">Complete Package</div>
          <div className="text-sm text-text-muted">Title, description, hashtags, CTA</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold mb-1">Optimized</div>
          <div className="text-sm text-text-muted">For social media engagement</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">💎</div>
          <div className="font-semibold mb-1">Professional</div>
          <div className="text-sm text-text-muted">Marketing-grade content</div>
        </div>
      </div>
    </div>
  )
}
