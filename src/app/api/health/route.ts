import { NextRequest, NextResponse } from 'next/server'

// Health check endpoint for monitoring
export async function GET(request: NextRequest) {
  const start = Date.now()
  
  try {
    // Check database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    const dbTime = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'healthy',
          latency: dbTime,
        },
        api: {
          status: 'healthy',
          latency: Date.now() - start,
        },
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}
