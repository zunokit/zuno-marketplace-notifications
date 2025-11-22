import { NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { withAuth } from '@/lib/api/route-handler'
import { withAuthorization } from '@/lib/api/with-authorization'

/**
 * Get notification by ID
 *
 * @route GET /api/notifications/:id
 * @access Authenticated users with read permission
 * @authorization Requires notification belongs to user's organization
 */
export const GET = withAuth(
  withAuthorization(
    { resource: 'notification', action: 'read' },
    async (request, context, params: { id: string }) => {
      try {
        const notification = await prisma.notification.findUnique({
          where: { id: params.id },
          include: {
            organization: { select: { name: true } },
            user: { select: { email: true, name: true } },
            template: { select: { name: true, slug: true } },
            deliveryAttempts: {
              orderBy: { attemptedAt: 'desc' },
              take: 10,
            },
          },
        })

        if (!notification) {
          return NextResponse.json(
            { error: 'Notification not found' },
            { status: 404 }
          )
        }

        return NextResponse.json(notification)
      } catch (error) {
        logger.error('Error fetching notification', {
          error: error instanceof Error ? error.message : 'Unknown error',
          notificationId: params.id,
          userId: context.user.id,
        })
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  )
)
