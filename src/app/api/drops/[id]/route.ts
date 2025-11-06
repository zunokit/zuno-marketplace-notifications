import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const drop = await prisma.drop.findUnique({
      where: { id },
      include: {
        whitelistEntries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!drop) {
      return NextResponse.json(
        {
          success: false,
          error: 'Drop not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: drop,
    })
  } catch (error) {
    logger.error('Error fetching drop', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch drop',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
