'use client'

import Link from 'next/link'
import { Check, Zap, Crown, Rocket, Sparkles } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: 9,
      period: '/month',
      description: 'Perfect for individual creators just getting started',
      features: [
        '$500 monthly transaction volume',
        '1 active pass collection',
        '$100 max bounty size',
        'Basic analytics dashboard',
        'Frame creation tools',
        'Standard support',
        '2% platform fee',
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: 'blue',
    },
    {
      name: 'Pro',
      icon: Crown,
      price: 29,
      period: '/month',
      description: 'For growing creators and small teams',
      features: [
        '$10,000 monthly transaction volume',
        '5 active pass collections',
        '$1,000 max bounty size',
        'Advanced analytics + exports',
        'Priority frame publishing',
        'AI content generation (10 credits)',
        'Priority support',
        '1.5% platform fee',
        'Custom branding',
      ],
      cta: 'Go Pro',
      popular: true,
      color: 'purple',
    },
    {
      name: 'Power',
      icon: Rocket,
      price: 99,
      period: '/month',
      description: 'For power users and larger teams',
      features: [
        '$100,000 monthly transaction volume',
        'Unlimited pass collections',
        '$10,000 max bounty size',
        'Full analytics suite + API access',
        'Instant frame publishing',
        'AI content generation (50 credits)',
        'Dedicated account manager',
        '1% platform fee',
        'Custom branding + white-label',
        'Early access to new features',
        'Quarterly strategy sessions',
      ],
      cta: 'Get Power',
      popular: false,
      color: 'orange',
    },
  ]

  const addOns = [
    { name: 'AI Lore Generation', price: '$1.50', unit: 'per generation' },
    { name: 'AI Promo Pack', price: '$2.50', unit: 'per generation' },
    { name: 'Extra Transaction Volume', price: '$0.01', unit: 'per dollar over limit' },
    { name: 'Additional Pass Collection', price: '$5', unit: 'per month' },
    { name: 'Priority Support Upgrade', price: '$20', unit: 'per month' },
  ]

  const faqs = [
    {
      q: 'What happens if I exceed my transaction volume?',
      a: 'You can continue transacting at a $0.01 per dollar overage fee, or upgrade to a higher tier for better rates.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes! All plans are month-to-month with no long-term commitments. Cancel anytime from your dashboard.',
    },
    {
      q: 'Do admin wallets pay subscription fees?',
      a: 'Admin wallets (Wallet A & B) have free access to all features and only pay network/gas fees.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept USDC on Base, Ethereum, Polygon, Arbitrum, and other supported chains. Credit card payments coming soon.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes! All plans include a 7-day free trial. No credit card required to start.',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className={`card relative ${
                plan.popular ? 'border-primary shadow-xl shadow-primary/20 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-${plan.color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 text-${plan.color}-500`} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-text-muted text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-text-muted">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout?plan=${plan.name.toLowerCase()}`}
                className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </Link>
            </div>
          )
        })}
      </div>

      {/* Add-ons */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Add-ons & Extras</h2>
          <p className="text-text-muted">
            Enhance your plan with additional features and services
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {addOns.map((addon, index) => (
            <div key={index} className="card flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">{addon.name}</div>
                <div className="text-sm text-text-muted">{addon.unit}</div>
              </div>
              <div className="text-2xl font-bold text-primary">{addon.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features Highlight */}
      <div className="card bg-gradient-to-r from-purple-500/20 to-primary/20 border-primary/30 max-w-4xl mx-auto mb-16 text-center">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">AI-Powered Content Generation</h3>
        <p className="text-text-muted mb-6 max-w-xl mx-auto">
          Generate compelling lore ($1.50) and professional promo packs ($2.50) with our AI tools. 
          Admin wallets get free access!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/api/ai/lore" className="btn btn-primary">
            Try Lore Generator
          </Link>
          <Link href="/api/ai/promo" className="btn btn-secondary">
            Try Promo Generator
          </Link>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="card">
              <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
              <p className="text-text-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/30 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-text-muted mb-6 max-w-xl mx-auto">
          Join thousands of creators building on Base. Start your free trial today.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/checkout?plan=pro" className="btn btn-primary text-lg px-8">
            Start Free Trial
          </Link>
          <Link href="/contact" className="btn btn-secondary text-lg px-8">
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  )
}
