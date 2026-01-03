import { NextRequest, NextResponse } from 'next/server'

// Actions Frame - Pay-per-action flows
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { untrustedData, trustedData } = body

    const buttonIndex = untrustedData?.buttonIndex || 1
    const fid = untrustedData?.fid
    const inputText = untrustedData?.inputText || ''

    let imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-actions.png`
    let buttons = [
      { label: 'Tip / Pay', action: 'post' },
      { label: 'Unlock Content', action: 'post' },
      { label: 'Mint NFT', action: 'post' },
      { label: 'Back', action: 'post' },
    ]

    if (buttonIndex === 4) {
      // Back to home
      return NextResponse.redirect(new URL('/api/frame/home', request.url))
    }

    // Generate contextual response
    if (buttonIndex === 1) {
      // Tip / Pay
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-tip.png`
      buttons = [
        { label: 'Send Tip', action: 'tx' },
        { label: 'Custom Amount', action: 'post' },
        { label: 'Recent Tips', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 2) {
      // Unlock Content
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-unlock.png`
      buttons = [
        { label: 'Enter Content ID', action: 'post' },
        { label: 'My Unlocked', action: 'post' },
        { label: 'Featured', action: 'post' },
        { label: 'Back', action: 'post' },
      ]
    } else if (buttonIndex === 3) {
      // Mint NFT
      imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-mint.png`
      buttons = [
        { label: 'Browse Collections', action: 'post' },
        { label: 'My Mints', action: 'post' },
        { label: 'Create Collection', action: 'post' },
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
            actionType: btn.action === 'tx' ? 'tx' : btn.action === 'link' ? 'link' : 'post',
          })),
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/actions`,
          input: {
            type: 'text',
            placeholder: buttonIndex === 1 ? 'Enter recipient address...' : 'Enter content ID...',
          },
        },
      },
    })
  } catch (error) {
    console.error('Actions frame error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/images/frame-actions.png`,
    buttons: ['Tip / Pay', 'Unlock Content', 'Mint NFT', 'Back'],
    postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/actions`,
  })
}
