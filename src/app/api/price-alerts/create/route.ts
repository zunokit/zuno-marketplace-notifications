import { NextRequest, NextResponse } from 'next/server'
import { PriceAlertService } from '@/core/services/price-alert.service'
import { logger } from '@/lib/logger/logger'
import { z } from 'zod'

const createPriceAlertSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  itemType: z.enum(['nft', 'collection']),
  itemId: z.string(),
  targetPrice: z.number().positive(),
  condition: z.enum(['above', 'below', 'equals']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPriceAlertSchema.parse(body)

    const priceAlertService = new PriceAlertService()
    const priceAlert = await priceAlertService.createPriceAlert(validatedData)

    logger.info('Price alert created', {
      priceAlertId: priceAlert.id,
      userId: validatedData.userId,
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
