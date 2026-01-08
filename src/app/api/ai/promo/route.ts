import { NextRequest, NextResponse } from 'next/server'
import { getPaymentWallet, detectFIDFromRequest, getPlatformFromFID, isAdminWallet } from '@/lib/wallet-detector'
import { initiatePayment, updateFeatureAccess } from '@/lib/payment-handler'

const PROMO_PRICE = parseFloat(process.env.NEXT_PUBLIC_AI_PROMO_PRICE || '2.50')
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productName, description, chain, platform: bodyPlatform, walletAddress } = body

    if (!productName || typeof productName !== 'string') {
      return NextResponse.json(
        { error: 'Product name is required' },
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
        amount: PROMO_PRICE,
        toWallet: paymentWallet.address,
        chain: selectedChain,
        fromWallet: walletAddress,
        platform,
        featureUsed: 'promo',
      })

      if (!paymentResult.success && paymentResult.status !== 'admin-free') {
        return NextResponse.json(
          { 
            error: 'Payment initiation failed', 
            message: paymentResult.message,
            paymentRequired: true,
            amount: PROMO_PRICE,
            paymentWallet: paymentWallet.address,
            supportedChains: paymentWallet.chains,
          },
          { status: 402 }
        )
      }
    }

    let promoContent = {
      title: '',
      description: '',
      hashtags: [] as string[],
      callToAction: '',
    }
    
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
              content: 'You are a marketing expert. Create a compelling promotional pack including: title, description (50-100 words), 5 relevant hashtags, and a call-to-action. Format your response as JSON with keys: title, description, hashtags (array), callToAction.',
            },
            {
              role: 'user',
              content: `Product: ${productName}\n${description ? `Details: ${description}` : ''}`,
            },
          ],
          max_tokens: 600,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      })

      if (!openRouterResponse.ok) {
        throw new Error('AI generation failed')
      }

      const aiData = await openRouterResponse.json()
      const content = aiData.choices?.[0]?.message?.content
      
      if (content) {
        try {
          promoContent = JSON.parse(content)
        } catch {
          promoContent = {
            title: productName,
            description: content,
            hashtags: ['#Web3', '#Creator', '#OnChain', '#Base', '#Farcaster'],
            callToAction: 'Learn more today!',
          }
        }
      }
    } else {
      promoContent = {
        title: `Introducing ${productName}`,
        description: `[Demo Mode] ${productName} is revolutionizing the onchain creator economy. ${description || 'Discover the future of decentralized creativity.'}`,
        hashtags: ['#Web3', '#Creator', '#OnChain', '#Base', '#Farcaster'],
        callToAction: 'Join the revolution today!',
      }
    }

    if (walletAddress && !isAdmin) {
      await updateFeatureAccess(walletAddress, platform, PROMO_PRICE)
    }

    return NextResponse.json({
      promo: promoContent,
      cost: isAdmin ? 0 : PROMO_PRICE,
      paymentWallet: paymentWallet.address,
      supportedChains: paymentWallet.chains,
      platform,
      isAdmin,
    })
  } catch (error) {
    console.error('Promo generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate promo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
