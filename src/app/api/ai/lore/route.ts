import { NextRequest, NextResponse } from 'next/server'
import { getPaymentWallet, detectFIDFromRequest, getPlatformFromFID, isAdminWallet } from '@/lib/wallet-detector'
import { initiatePayment, updateFeatureAccess } from '@/lib/payment-handler'

const LORE_PRICE = parseFloat(process.env.NEXT_PUBLIC_AI_LORE_PRICE || '1.50')
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, chain, platform: bodyPlatform, walletAddress } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      )
    }

    const fid = detectFIDFromRequest(req.headers)
    let platform: 'farcaster' | 'base-app' = bodyPlatform || 'base-app'
    
    if (fid) {
      const detectedPlatform = getPlatformFromFID(fid)
      if (detectedPlatform) {
        platform = detectedPlatform
      }
    }

    const paymentWallet = getPaymentWallet(platform)
    const isAdmin = walletAddress ? isAdminWallet(walletAddress) : false

    if (!isAdmin && !OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      )
    }

    const selectedChain = chain || paymentWallet.chains[0]

    if (!isAdmin) {
      const paymentResult = await initiatePayment({
        amount: LORE_PRICE,
        toWallet: paymentWallet.address,
        chain: selectedChain,
        fromWallet: walletAddress,
        platform,
        featureUsed: 'lore',
      })

      if (!paymentResult.success && paymentResult.status !== 'admin-free') {
        return NextResponse.json(
          { 
            error: 'Payment initiation failed', 
            message: paymentResult.message,
            paymentRequired: true,
            amount: LORE_PRICE,
            paymentWallet: paymentWallet.address,
            supportedChains: paymentWallet.chains,
          },
          { status: 402 }
        )
      }
    }

    let loreContent = ''
    
    if (OPENROUTER_API_KEY) {
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://onchain-creator-hub.vercel.app',
          'X-Title': 'Onchain Creator Hub',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: 'You are a creative storyteller and lore master. Generate rich, engaging lore content based on the user\'s prompt. Keep it concise but captivating (200-300 words).',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      })

      if (!openRouterResponse.ok) {
        throw new Error('AI generation failed')
      }

      const aiData = await openRouterResponse.json()
      loreContent = aiData.choices?.[0]?.message?.content || 'Lore generation unavailable'
    } else {
      loreContent = `[Demo Mode] Lore for "${prompt}": In the depths of the onchain realm, legends speak of creators who wielded the power of decentralized stories...`
    }

    if (walletAddress && !isAdmin) {
      await updateFeatureAccess(walletAddress, platform, LORE_PRICE)
    }

    return NextResponse.json({
      lore: loreContent,
      cost: isAdmin ? 0 : LORE_PRICE,
      paymentWallet: paymentWallet.address,
      supportedChains: paymentWallet.chains,
      platform,
      isAdmin,
    })
  } catch (error) {
    console.error('Lore generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate lore', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
