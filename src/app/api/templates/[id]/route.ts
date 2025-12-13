import { NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { withAuth } from '@/lib/api/route-handler'
import { withAuthorization } from '@/lib/api/with-authorization'

/**
 * Get template by ID
 *
 * @route GET /api/templates/:id
 * @access Authenticated users with read permission
 */
export const GET = withAuth(
  withAuthorization(
    { resource: 'template', action: 'read' },
    async (_request, context, params: { id: string }) => {
      try {
        const template = await prisma.template.findUnique({
          where: { id: params.id },
          include: {
            versions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        })

        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }

        return NextResponse.json(template)
      } catch (error) {
        logger.error('Error fetching template', {
          error: error instanceof Error ? error.message : 'Unknown error',
          templateId: params.id,
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

/**
 * Update template
 *
 * @route PUT /api/templates/:id
 * @access Authenticated users with update permission
 */
export const PUT = withAuth(
  withAuthorization(
    { resource: 'template', action: 'write' },
    async (request, context, params: { id: string }) => {
      try {
        const body = await request.json()

        const template = await prisma.template.update({
          where: { id: params.id },
          data: {
            name: body.name,
            subject: body.subject,
            body: body.body,
            bodyText: body.bodyText,
            variables: body.variables,
            description: body.description,
            isActive: body.isActive,
          },
        })

        logger.info('Template updated', {
          templateId: params.id,
          userId: context.user.id,
          organizationId: context.organization.id,
        })

        return NextResponse.json(template)
      } catch (error) {
        logger.error('Error updating template', {
          error: error instanceof Error ? error.message : 'Unknown error',
          templateId: params.id,
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

/**
 * Delete template (soft delete)
 *
 * @route DELETE /api/templates/:id
 * @access Authenticated users with delete permission
 */
export const DELETE = withAuth(
  withAuthorization(
    { resource: 'template', action: 'delete' },
    async (_request, context, params: { id: string }) => {
      try {
        await prisma.template.update({
          where: { id: params.id },
          data: { isActive: false, deprecatedAt: new Date() },
        })

        logger.info('Template deleted', {
          templateId: params.id,
          userId: context.user.id,
          organizationId: context.organization.id,
        })

        return NextResponse.json({ success: true })
      } catch (error) {
        logger.error('Error deleting template', {
          error: error instanceof Error ? error.message : 'Unknown error',
          templateId: params.id,
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
