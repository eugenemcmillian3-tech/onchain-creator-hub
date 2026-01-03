import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAdminSession } from '@/lib/auth'

// GET /api/admin/features - Get all feature flags
export async function GET() {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ flags })
  } catch (error) {
    console.error('Failed to get feature flags:', error)
    return NextResponse.json({ error: 'Failed to get feature flags' }, { status: 500 })
  }
}

// POST /api/admin/features - Update feature flags
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const body = await request.json()
    const { flags } = body

    if (!Array.isArray(flags)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Update each flag
    for (const update of flags) {
      await prisma.featureFlag.upsert({
        where: { key: update.key },
        update: { enabled: update.enabled },
        create: {
          key: update.key,
          enabled: update.enabled,
        },
      })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user?.address,
        action: 'FEATURE_FLAG_UPDATE',
        resource: 'feature_flag',
        details: { updatedFlags: flags.map((f: any) => ({ key: f.key, enabled: f.enabled })) },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update feature flags:', error)
    return NextResponse.json({ error: 'Failed to update feature flags' }, { status: 500 })
  }
}
