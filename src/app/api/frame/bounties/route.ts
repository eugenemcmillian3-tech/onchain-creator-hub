import { NextRequest, NextResponse } from 'next/server'

// Bounties Frame - Bounty management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { untrustedData } = body

    const buttonIndex = untrustedData?.buttonIndex || 1

    let imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-bounties.png`
    let buttons = [
      { label: 'Post Bounty', action: 'post' },
      { label: 'Browse Bounties', action: 'post' },
      { label: 'My Work', action: 'post' },
      { label: 'Back', action: 'post' },
    ]

    if (buttonIndex === 4) {
      return NextResponse.redirect(new URL('/api/frame/home', request.url))
    }

    if (buttonIndex === 1) {
      // Post Bounty
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-post-bounty.png`
      buttons = [
        { label: 'Set Amount', action: 'post' },
        { label: 'Add Details', action: 'post' },
        { label: 'Set Deadline', action: 'post' },
        { label: 'Fund & Post', action: 'tx' },
      ]
    } else if (buttonIndex === 2) {
      // Browse Bounties
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-browse-bounties.png`
      buttons = [
        { label: 'High Value', action: 'post' },
        { label: 'Recent', action: 'post' },
        { label: 'My Skills', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 3) {
      // My Work
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-my-work.png`
      buttons = [
        { label: 'Active Submissions', action: 'post' },
        { label: 'Completed', action: 'post' },
        { label: 'Won Bounties', action: 'post' },
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
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/bounties`,
        },
      },
    })
  } catch (error) {
    console.error('Bounties frame error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-bounties.png`,
    buttons: ['Post Bounty', 'Browse Bounties', 'My Work', 'Back'],
    postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/bounties`,
  })
}
