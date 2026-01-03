import { NextRequest, NextResponse } from 'next/server'
import { generateNonce, verifySignature, setAdminSession, isAdminWallet, createSiweMessage } from '@/lib/auth'

// POST /api/auth/siwe - Generate nonce or verify signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, address, signature, nonce } = body

    if (action === 'generate_nonce') {
      // Generate a new nonce for the address
      if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 })
      }

      // Check if address is admin
      if (!isAdminWallet(address)) {
        return NextResponse.json({ error: 'Unauthorized wallet' }, { status: 403 })
      }

      const newNonce = await generateNonce(address)
      const message = createSiweMessage(newNonce)

      return NextResponse.json({
        nonce: newNonce,
        message,
      })
    }

    if (action === 'verify') {
      // Verify the signature
      if (!address || !signature || !nonce) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Check if address is admin
      if (!isAdminWallet(address)) {
        return NextResponse.json({ error: 'Unauthorized wallet' }, { status: 403 })
      }

      const verification = await verifySignature(address, signature, nonce)

      if (!verification.success) {
        return NextResponse.json({ error: verification.message }, { status: 401 })
      }

      // Create session
      const sessionData = {
        address: address.toLowerCase(),
        role: 'admin',
        isAdmin: true,
        createdAt: Date.now(),
      }

      setAdminSession(sessionData)

      return NextResponse.json({
        success: true,
        address: address.toLowerCase(),
        role: 'admin',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('SIWE error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

// GET /api/auth/siwe - Check session status
export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('admin-session')

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )

    if (!isAdminWallet(sessionData.address)) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      address: sessionData.address,
      role: sessionData.role,
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

// Helper imports
import { cookies } from 'next/headers'
