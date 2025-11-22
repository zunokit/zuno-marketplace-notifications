import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = await prisma.template.findUnique({
      where: { id },
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
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const template = await prisma.template.update({
      where: { id },
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

    logger.info('Template updated', { templateId: id })

    return NextResponse.json(template)
  } catch (error) {
    logger.error('Error updating template', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
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
    await prisma.template.update({
      where: { id },
      data: { isActive: false, deprecatedAt: new Date() },
    })

    logger.info('Template deleted', { templateId: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting template', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
