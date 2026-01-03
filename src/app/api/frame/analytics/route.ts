import { NextRequest, NextResponse } from 'next/server'

// Analytics Frame - Stats and insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { untrustedData } = body

    const buttonIndex = untrustedData?.buttonIndex || 1

    let imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-analytics.png`
    let buttons = [
      { label: 'Creator Stats', action: 'post' },
      { label: 'Bounty Stats', action: 'post' },
      { label: 'Upgrade Plan', action: 'link' },
      { label: 'Back', action: 'post' },
    ]

    if (buttonIndex === 4) {
      return NextResponse.redirect(new URL('/api/frame/home', request.url))
    }

    if (buttonIndex === 1) {
      // Creator Stats
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-creator-stats.png`
      buttons = [
        { label: 'Earnings', action: 'post' },
        { label: 'Volume', action: 'post' },
        { label: 'Top Content', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 2) {
      // Bounty Stats
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-bounty-stats.png`
      buttons = [
        { label: 'Posted', action: 'post' },
        { label: 'Completed', action: 'post' },
        { label: 'Earnings', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 3) {
      // Upgrade Plan - redirect to pricing page
      return NextResponse.redirect(new URL('/pricing', process.env.NEXT_PUBLIC_APP_URL))
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
            actionType: btn.action === 'link' ? 'link' : 'post',
          })),
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/analytics`,
        },
      },
    })
  } catch (error) {
    console.error('Analytics frame error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-analytics.png`,
    buttons: ['Creator Stats', 'Bounty Stats', 'Upgrade Plan', 'Back'],
    postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/analytics`,
  })
}
