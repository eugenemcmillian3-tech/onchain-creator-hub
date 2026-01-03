import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAdminSession } from '@/lib/auth'
import { encryptSecret, decryptSecret, maskSecret } from '@/lib/encryption'

// GET /api/admin/secrets - Get all secrets (masked)
export async function GET() {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const secrets = await prisma.systemConfig.findMany({
      where: { isSecret: true },
      orderBy: { key: 'asc' },
    })

    // Return secrets with masked values
    const maskedSecrets = secrets.map(secret => ({
      id: secret.id,
      key: secret.key,
      masked: maskSecret(secret.value),
      description: secret.description,
      updatedAt: secret.updatedAt,
      updatedBy: secret.updatedBy,
    }))

    return NextResponse.json({ secrets: maskedSecrets })
  } catch (error) {
    console.error('Failed to get secrets:', error)
    return NextResponse.json({ error: 'Failed to get secrets' }, { status: 500 })
  }
}

// POST /api/admin/secrets - Add a new secret
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description } = body

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    // Encrypt the secret
    const { encrypted, iv } = encryptSecret(value)

    // Store in database
    await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: encrypted,
        iv,
        description: description || null,
        updatedBy: session.user?.address,
      },
      create: {
        key,
        value: encrypted,
        iv,
        isSecret: true,
        description: description || null,
        updatedBy: session.user?.address,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user?.address,
        action: 'SECRET_ADD',
        resource: 'system_config',
        resourceId: key,
      },
    })

    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error('Failed to add secret:', error)
    return NextResponse.json({ error: 'Failed to add secret' }, { status: 500 })
  }
}

// PUT /api/admin/secrets - Rotate or update a secret
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, action } = body

    // Find existing secret
    const existing = await prisma.systemConfig.findUnique({
      where: { key },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 })
    }

    if (action === 'rotate') {
      // For rotation, we need the current value to be provided
      // In a real implementation, you might want to use a rotation service
      // For now, we'll just log the rotation request
      await prisma.auditLog.create({
        data: {
          userId: session.user?.address,
          action: 'SECRET_ROTATE_REQUEST',
          resource: 'system_config',
          resourceId: key,
        },
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Secret rotation requested. Please provide the new value.' 
      })
    }

    // Regular update
    if (!value) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }

    // Encrypt the new value
    const { encrypted, iv } = encryptSecret(value)

    await prisma.systemConfig.update({
      where: { key },
      data: {
        value: encrypted,
        iv,
        updatedBy: session.user?.address,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user?.address,
        action: 'SECRET_UPDATE',
        resource: 'system_config',
        resourceId: key,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update secret:', error)
    return NextResponse.json({ error: 'Failed to update secret' }, { status: 500 })
  }
}

// DELETE /api/admin/secrets - Delete a secret
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session.success) {
      return NextResponse.json({ error: session.error }, { status: 401 })
    }

    const body = await request.json()
    const { key } = body

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const deleted = await prisma.systemConfig.delete({
      where: { key, isSecret: true },
    }).catch(() => null)

    if (!deleted) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user?.address,
        action: 'SECRET_DELETE',
        resource: 'system_config',
        resourceId: key,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete secret:', error)
    return NextResponse.json({ error: 'Failed to delete secret' }, { status: 500 })
  }
}
