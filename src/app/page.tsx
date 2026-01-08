'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Zap, Coins, Users, BarChart3, Globe, Sparkles, Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { detectSource, getSourceWallet } from '@/lib/wallet-detector'

export default function HomePage() {
  const [source, setSource] = useState<'farcaster' | 'base-app' | 'direct'>('direct')
  const [sourceWallet, setSourceWallet] = useState<any>(null)

  useEffect(() => {
    const detectedSource = detectSource()
    setSource(detectedSource)
    setSourceWallet(getSourceWallet(detectedSource))
  }, [])
  const features = [
    {
      icon: Sparkles,
      title: 'AI Lore Generation',
      description: 'Generate compelling lore and stories for your projects with AI. $1.50 per generation, admin wallets free.',
    },
    {
      icon: Megaphone,
      title: 'AI Promo Packs',
      description: 'Create professional promotional content with AI-powered marketing. $2.50 per pack, admin wallets free.',
    },
    {
      icon: Coins,
      title: 'Pay-Per-Action Frames',
      description: 'Tips, paywalls, and NFT mints with automatic fee splitting. Built on Farcaster Frames for seamless user experience.',
    },
    {
      icon: Shield,
      title: 'Creator Access Passes',
      description: 'Deploy soulbound or transferable access pass NFTs. Gate content and communities with onchain verification.',
    },
    {
      icon: Users,
      title: 'Escrowed Bounties',
      description: 'Post bounties with funds locked in smart contracts. Safe payment upon work completion.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track earnings, volume, and user engagement. Pay-per-query or use bundled queries with subscriptions.',
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'For individual creators',
      features: [
        '$500 monthly volume',
        '1 active pass collection',
        '$100 max bounty size',
        'Basic analytics',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For growing creators',
      features: [
        '$10K monthly volume',
        '5 active pass collections',
        '$1K max bounty size',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Go Pro',
      popular: true,
    },
    {
      name: 'Power',
      price: '$99',
      period: '/month',
      description: 'For power users',
      features: [
        '$100K monthly volume',
        'Unlimited passes',
        '$10K max bounty size',
        'Full analytics suite',
        'API access',
        'Dedicated support',
      ],
      cta: 'Get Power',
      popular: false,
    },
  ]

  const stats = [
    { value: '$2.5M+', label: 'Volume Processed' },
    { value: '12K+', label: 'Bounties Completed' },
    { value: '8K+', label: 'Active Creators' },
    { value: '50K+', label: 'Passes Minted' },
  ]

  return (
    <div className="flex flex-col gap-20 py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base/20 text-base text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Built on Base + Farcaster
          </div>
          {source !== 'direct' && sourceWallet && (
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary text-sm font-medium">
              <Shield className="w-4 h-4" />
              Connected via {source === 'farcaster' ? 'Farcaster' : 'Base App'} • FID: {sourceWallet.fid}
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Create, Earn, and Collaborate on{' '}
            <span className="gradient-text">Base Chain</span>
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
            The all-in-one platform for creators and hunters. Pay-per-action Frames, 
            creator passes, escrowed bounties, AI-powered content, and powerful analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bounties" className="btn btn-primary text-lg px-8 py-3">
              Explore Bounties
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/pricing" className="btn btn-secondary text-lg px-8 py-3">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card text-center">
              <div className="stat-value gradient-text">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            A complete toolkit for creators and hunters on the Base ecosystem.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card-hover">
              <div className="w-12 h-12 rounded-xl bg-base/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-base" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-muted text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-text-muted">Get started in minutes</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Link your Farthercast and wallet' },
              { step: '02', title: 'Choose Plan', desc: 'Subscribe or pay-per-use' },
              { step: '03', title: 'Start Creating', desc: 'Launch frames, passes, bounties' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-surface-light mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-text-muted">{item.desc}</p>
                {item.step !== '03' && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-surface-light" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-text-muted">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${plan.popular ? 'border-primary glow' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-base text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-text-muted text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-text-muted">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-base flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.popular ? '/dashboard' : '/pricing'}
                className={`btn w-full ${
                  plan.popular ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-text-muted text-sm mt-6">
          Or pay-per-use with higher per-action fees. No free tier.
        </p>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="card bg-gradient-to-r from-base/20 to-purple-500/20 border-primary/30 text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-text-muted mb-6 max-w-xl mx-auto">
            Join thousands of creators and hunters building on Base. 
            Connect your wallet and start creating today.
          </p>
          <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
            Launch App
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}
