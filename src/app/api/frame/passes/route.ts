import { NextRequest, NextResponse } from 'next/server'

// Passes Frame - Access pass management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { untrustedData } = body

    const buttonIndex = untrustedData?.buttonIndex || 1

    let imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-passes.png`
    let buttons = [
      { label: 'Create Pass', action: 'post' },
      { label: 'View My Passes', action: 'post' },
      { label: 'Top Passes', action: 'post' },
      { label: 'Back', action: 'post' },
    ]

    if (buttonIndex === 4) {
      return NextResponse.redirect(new URL('/api/frame/home', request.url))
    }

    if (buttonIndex === 1) {
      // Create Pass
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-create-pass.png`
      buttons = [
        { label: 'Set Name & Price', action: 'post' },
        { label: 'Configure Supply', action: 'post' },
        { label: 'Mint Settings', action: 'post' },
        { label: 'Launch', action: 'post' },
      ]
    } else if (buttonIndex === 2) {
      // View My Passes
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-my-passes.png`
      buttons = [
        { label: 'Active Passes', action: 'post' },
        { label: 'Past Mints', action: 'post' },
        { label: 'Analytics', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 3) {
      // Top Passes
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-top-passes.png`
      buttons = [
        { label: 'Trending', action: 'post' },
        { label: 'Top Volume', action: 'post' },
        { label: 'Newest', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    }

    return NextResponse.json({
      method: 'POST',
      fc: {
        frame: {
          version: 'next',
          image: { src: imageUrl },
          buttons: buttons.map((btn, index) => ({
            index: index + 1,
            label: btn.label,
            actionType: btn.action === 'tx' ? 'tx' : 'post',
          })),
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/passes`,
        },
      },
    })
  } catch (error) {
    console.error('Passes frame error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-passes.png`,
    buttons: ['Create Pass', 'View My Passes', 'Top Passes', 'Back'],
    postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/passes`,
  })
}
