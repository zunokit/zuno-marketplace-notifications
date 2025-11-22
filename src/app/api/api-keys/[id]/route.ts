import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      usageCount: apiKey.usageCount,
      expiresAt: apiKey.expiresAt,
      organization: apiKey.organization,
      createdAt: apiKey.createdAt,
    })
  } catch (error) {
    logger.error('Error fetching API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete by deactivating
    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    })

    logger.info('API key revoked', { keyId: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error revoking API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    )
  }
}
