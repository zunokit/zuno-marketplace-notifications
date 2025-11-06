import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Deactivate the price alert instead of deleting
    const priceAlert = await prisma.priceAlert.update({
      where: { id },
      data: {
        isActive: false,
      },
    })

    logger.info('Price alert deactivated', {
      priceAlertId: id,
    })

    return NextResponse.json({
      success: true,
      data: priceAlert,
    })
  } catch (error) {
    logger.error('Error deleting price alert', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete price alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const priceAlert = await prisma.priceAlert.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!priceAlert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Price alert not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: priceAlert,
    })
  } catch (error) {
    logger.error('Error fetching price alert', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
