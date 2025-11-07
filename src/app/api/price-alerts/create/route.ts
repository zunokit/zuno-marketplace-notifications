import { NextRequest, NextResponse } from 'next/server'
import { PriceAlertService } from '@/core/services/price-alert.service'
import { logger } from '@/lib/logger/logger'
import { requireAuth, requireOrganizationMembership } from '@/lib/auth/api-auth'
import { z } from 'zod'

const createPriceAlertSchema = z.object({
  itemType: z.enum(['nft', 'collection']),
  itemId: z.string(),
  targetPrice: z.number().positive(),
  condition: z.enum(['above', 'below', 'equals']),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = requireAuth(request)

    // Get user's organization
    const { organizationId } = await requireOrganizationMembership(userId)

    const body = await request.json()
    const validatedData = createPriceAlertSchema.parse(body)

    const priceAlertService = new PriceAlertService()
    const priceAlert = await priceAlertService.createPriceAlert({
      userId,
      organizationId,
      ...validatedData,
    })

    logger.info('Price alert created', {
      priceAlertId: priceAlert.id,
      userId,
      itemType: validatedData.itemType,
      itemId: validatedData.itemId,
    })

    return NextResponse.json({
      success: true,
      data: priceAlert,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      )
    }

    logger.error('Error creating price alert', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create price alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
