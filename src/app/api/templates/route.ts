import { NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { withAuth } from '@/lib/api/route-handler'

/**
 * List templates for the authenticated user's organization
 *
 * @route GET /api/templates
 * @access Authenticated users
 */
export const GET = withAuth(async (_request, { organization }) => {
  try {
    const templates = await prisma.template.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        channel: true,
        type: true,
        version: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    logger.error('Error fetching templates', {
      error: error instanceof Error ? error.message : 'Unknown error',
      organizationId: organization.id,
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
