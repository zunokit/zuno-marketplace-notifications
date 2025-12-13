import { NextRequest, NextResponse } from 'next/server'
import { WatchlistService } from '@/core/services/watchlist.service'
import { logger } from '@/lib/logger/logger'
import { z } from 'zod'

const addToWatchlistSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  itemType: z.enum(['nft', 'collection', 'user']),
  itemId: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = addToWatchlistSchema.parse(body)

    const watchlistService = new WatchlistService()
    const watchlistEntry = await watchlistService.addToWatchlist(validatedData)

    logger.info('Item added to watchlist', {
      watchlistId: watchlistEntry.id,
      userId: validatedData.userId,
      itemType: validatedData.itemType,
      itemId: validatedData.itemId,
    })

    return NextResponse.json({
      success: true,
      data: watchlistEntry,
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

    logger.error('Error adding to watchlist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add to watchlist',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
