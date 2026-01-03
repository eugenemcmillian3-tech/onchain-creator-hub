'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount, useSignMessage } from 'wagmi'
import { Shield, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { generateNonce, verifySignature, setAdminSession } from '@/lib/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()
  const { signMessageAsync, isPending } = useSignMessage()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setError(null)
      setSuccess(false)

      // Generate nonce
      const nonce = await generateNonce(address)

      // Create SIWE message
      const siweMessage = `Sign in to Onchain Creator Hub Admin

This request will not trigger a blockchain transaction or cost any gas fees.

Nonce: ${nonce}`

      // Sign message
      const signature = await signMessageAsync({ message: siweMessage })

      // Verify signature
      const verification = await verifySignature(address, signature, nonce)

      if (!verification.success) {
        setError(verification.message)
        return
      }

      // Create session
      const sessionData = {
        address: address.toLowerCase(),
        role: 'admin',
        isAdmin: true,
        createdAt: Date.now(),
      }

      setAdminSession(sessionData)
      setSuccess(true)
      setMessage('Login successful! Redirecting...')

      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to login. Please try again.')
    }
  }

  const errorParam = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-base flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-text-muted mt-2">Platform Owner Wallet Only</p>
        </div>

        {/* Error Display */}
        {errorParam === 'unauthorized' && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">Unauthorized wallet address</p>
          </div>
        )}

        {errorParam === 'invalid_session' && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-400">Invalid session. Please login again.</p>
          </div>
        )}

        {/* Card */}
        <div className="card">
          {/* Status */}
          <div className="mb-6 p-4 rounded-xl bg-surface-light flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Wallet not connected'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-400">{message}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!isConnected || isPending || success}
            className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Success!
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Sign to Login
              </>
            )}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-surface-light text-sm text-text-muted">
            <p className="mb-2">
              <strong>Security Notice:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only the platform owner wallet can access</li>
              <li>Signature request does not trigger transactions</li>
              <li>Session expires after 24 hours</li>
            </ul>
          </div>
        </div>

        {/* Back Link */}
        <a href="/" className="block text-center text-text-muted hover:text-white mt-6 text-sm">
          ← Back to App
        </a>
      </div>
    </div>
  )
}
