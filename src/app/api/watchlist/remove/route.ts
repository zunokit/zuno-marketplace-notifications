import { NextRequest, NextResponse } from 'next/server'
import { WatchlistService } from '@/core/services/watchlist.service'
import { logger } from '@/lib/logger/logger'
import { z } from 'zod'

const removeFromWatchlistSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  itemType: z.enum(['nft', 'collection', 'user']),
  itemId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = removeFromWatchlistSchema.parse(body)

    const watchlistService = new WatchlistService()
    await watchlistService.removeFromWatchlist(validatedData)

    logger.info('Item removed from watchlist', {
      userId: validatedData.userId,
      itemType: validatedData.itemType,
      itemId: validatedData.itemId,
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from watchlist',
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

    logger.error('Error removing from watchlist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove from watchlist',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
