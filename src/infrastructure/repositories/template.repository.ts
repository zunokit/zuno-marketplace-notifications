import { prisma } from '@/infrastructure/database/prisma'

export class TemplateRepository {
  /**
   * Find active template by slug and organization
   */
  async findBySlug(organizationId: string, slug: string) {
    return await prisma.template.findFirst({
      where: {
        organizationId,
        slug,
        isActive: true,
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    })
  }

  /**
   * Find template by ID
   */
  async findById(id: string) {
    return await prisma.template.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    })
  }

  /**
   * List templates for organization
   */
  async listByOrganization(organizationId: string, includeInactive = false) {
    return await prisma.template.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            notifications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Update template
   */
  async update(
    id: string,
    data: {
      name?: string
      description?: string
      isActive?: boolean
    }
  ) {
    return await prisma.template.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete template (soft delete)
   */
  async delete(id: string) {
    return await prisma.template.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * Get template usage statistics
   */
  async getUsageStats(templateId: string) {
    const [totalUsage, recentUsage, successCount] = await Promise.all([
      prisma.notification.count({
        where: { templateId },
      }),
      prisma.notification.count({
        where: {
          templateId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.notification.count({
        where: {
          templateId,
          status: 'SENT',
        },
      }),
    ])

    const successRatePercent =
      totalUsage > 0 ? (successCount / totalUsage) * 100 : 0

    return {
      totalUsage,
      recentUsage,
      successRate: successRatePercent,
    }
  }
}
