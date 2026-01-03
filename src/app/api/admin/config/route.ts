import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAdminSession } from '@/lib/auth'

// GET /api/admin/config - Get all configuration
export async function GET() {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const configs = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    })

    // Return configs with masked values for secrets
    const maskedConfigs = configs.map(config => ({
      key: config.key,
      value: config.isSecret ? '••••••••' : config.value,
      isSecret: config.isSecret,
      description: config.description,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    }))

    return NextResponse.json({ configs: maskedConfigs })
  } catch (error) {
    console.error('Failed to get configs:', error)
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 })
  }
}

// POST /api/admin/config - Update configuration
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const body = await request.json()
    const { configs: configUpdates } = body

    if (!Array.isArray(configUpdates)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Update each config
    for (const update of configUpdates) {
      await prisma.systemConfig.upsert({
        where: { key: update.key },
        update: { value: update.value, updatedBy: session.user?.address },
        create: {
          key: update.key,
          value: update.value,
          isSecret: false,
          updatedBy: session.user?.address,
        },
      })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user?.address,
        action: 'CONFIG_UPDATE',
        resource: 'system_config',
        details: { updatedKeys: configUpdates.map((c: any) => c.key) },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update configs:', error)
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
  }
}
