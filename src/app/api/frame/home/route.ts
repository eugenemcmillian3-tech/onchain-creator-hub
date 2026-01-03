import { NextRequest, NextResponse } from 'next/server'

// Home Frame - Entry point for Farthercast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { untrustedData, trustedData } = body

    // Validate frame action using Neynar (in production)
    // const isValid = await validateFrameAction(untrustedData, trustedData)
    // if (!isValid) return NextResponse.json({ error: 'Invalid frame' }, { status: 400 })

    // Get button pressed
    const buttonIndex = untrustedData?.buttonIndex || 1

    // Frame response based on button
    let imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-home.png`
    let buttons = [
      { label: 'Actions', action: 'post' },
      { label: 'Passes', action: 'post' },
      { label: 'Bounties', action: 'post' },
      { label: 'Analytics', action: 'post' },
    ]

    if (buttonIndex === 1) {
      // Actions frame
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-actions.png`
      buttons = [
        { label: 'Tip / Pay', action: 'post' },
        { label: 'Unlock Content', action: 'post' },
        { label: 'Mint NFT', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 2) {
      // Passes frame
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-passes.png`
      buttons = [
        { label: 'Create Pass', action: 'post' },
        { label: 'View My Passes', action: 'post' },
        { label: 'Top Passes', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 3) {
      // Bounties frame
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-bounties.png`
      buttons = [
        { label: 'Post Bounty', action: 'post' },
        { label: 'Browse Bounties', action: 'post' },
        { label: 'My Work', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 4) {
      // Analytics frame
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-analytics.png`
      buttons = [
        { label: 'Creator Stats', action: 'post' },
        { label: 'Bounty Stats', action: 'post' },
        { label: 'Upgrade Plan', action: 'link' },
        { label: 'Back', action: 'post' },
      ]
    }

    return NextResponse.json({
      method: 'POST',
      // Frame vNext format
      fc: {
        frame: {
          version: 'next',
          image: { src: imageUrl },
          buttons: buttons.map((btn, index) => ({
            index: index + 1,
            label: btn.label,
            actionType: btn.action === 'link' ? 'link' : 'post',
          })),
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/home`,
          input: {
            type: 'text',
          },
        },
      },
    })
  } catch (error) {
    console.error('Home frame error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET for frame metadata
export async function GET() {
  return NextResponse.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-home.png`,
    buttons: ['Actions', 'Passes', 'Bounties', 'Analytics'],
    postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/home`,
  })
}
