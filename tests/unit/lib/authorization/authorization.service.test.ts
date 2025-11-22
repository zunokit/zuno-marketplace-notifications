/**
 * Authorization Service Tests
 */

import {
  AuthorizationService,
  AuthorizationContext,
} from '@/lib/authorization/authorization.service'
import { prisma } from '@/infrastructure/database/prisma'
import { Role } from '@/infrastructure/database/generated'

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    notification: {
      findUnique: jest.fn(),
    },
    template: {
      findUnique: jest.fn(),
    },
    priceAlert: {
      findUnique: jest.fn(),
    },
    watchlist: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock logger
jest.mock('@/lib/logger/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AuthorizationService', () => {
  let service: AuthorizationService
  let ownerContext: AuthorizationContext
  let adminContext: AuthorizationContext
  let editorContext: AuthorizationContext
  let viewerContext: AuthorizationContext

  beforeEach(() => {
    service = new AuthorizationService()
    jest.clearAllMocks()

    ownerContext = {
      userId: 'user-owner',
      organizationId: 'org-1',
      role: 'OWNER' as Role,
    }

    adminContext = {
      userId: 'user-admin',
      organizationId: 'org-1',
      role: 'ADMIN' as Role,
    }

    editorContext = {
      userId: 'user-editor',
      organizationId: 'org-1',
      role: 'EDITOR' as Role,
    }

    viewerContext = {
      userId: 'user-viewer',
      organizationId: 'org-1',
      role: 'VIEWER' as Role,
    }
  })

  describe('Role Permissions', () => {
    describe('OWNER role', () => {
      it('should allow read, write, delete', () => {
        const permissions = service.getPermissionsForRole('OWNER')
        expect(permissions).toEqual(['read', 'write', 'delete'])
      })

      it('can perform read action', () => {
        expect(service.canPerformAction('OWNER', 'read')).toBe(true)
      })

      it('can perform write action', () => {
        expect(service.canPerformAction('OWNER', 'write')).toBe(true)
      })

      it('can perform delete action', () => {
        expect(service.canPerformAction('OWNER', 'delete')).toBe(true)
      })
    })

    describe('ADMIN role', () => {
      it('should allow read, write, delete', () => {
        const permissions = service.getPermissionsForRole('ADMIN')
        expect(permissions).toEqual(['read', 'write', 'delete'])
      })
    })

    describe('EDITOR role', () => {
      it('should allow read, write but NOT delete', () => {
        const permissions = service.getPermissionsForRole('EDITOR')
        expect(permissions).toEqual(['read', 'write'])
      })

      it('can perform read action', () => {
        expect(service.canPerformAction('EDITOR', 'read')).toBe(true)
      })

      it('can perform write action', () => {
        expect(service.canPerformAction('EDITOR', 'write')).toBe(true)
      })

      it('cannot perform delete action', () => {
        expect(service.canPerformAction('EDITOR', 'delete')).toBe(false)
      })
    })

    describe('VIEWER role', () => {
      it('should allow ONLY read', () => {
        const permissions = service.getPermissionsForRole('VIEWER')
        expect(permissions).toEqual(['read'])
      })

      it('can perform read action', () => {
        expect(service.canPerformAction('VIEWER', 'read')).toBe(true)
      })

      it('cannot perform write action', () => {
        expect(service.canPerformAction('VIEWER', 'write')).toBe(false)
      })

      it('cannot perform delete action', () => {
        expect(service.canPerformAction('VIEWER', 'delete')).toBe(false)
      })
    })
  })

  describe('authorize() - Notification resource', () => {
    beforeEach(() => {
      ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue({
        id: 'notif-123',
        organizationId: 'org-1',
      })
    })

    it('OWNER can read notification from their org', async () => {
      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-123',
        'read'
      )

      expect(authorized).toBe(true)
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        select: { organizationId: true },
      })
    })

    it('ADMIN can delete notification from their org', async () => {
      const authorized = await service.authorize(
        adminContext,
        'notification',
        'notif-123',
        'delete'
      )

      expect(authorized).toBe(true)
    })

    it('EDITOR can write notification from their org', async () => {
      const authorized = await service.authorize(
        editorContext,
        'notification',
        'notif-123',
        'write'
      )

      expect(authorized).toBe(true)
    })

    it('EDITOR cannot delete notification', async () => {
      const authorized = await service.authorize(
        editorContext,
        'notification',
        'notif-123',
        'delete'
      )

      expect(authorized).toBe(false)
    })

    it('VIEWER can read notification from their org', async () => {
      const authorized = await service.authorize(
        viewerContext,
        'notification',
        'notif-123',
        'read'
      )

      expect(authorized).toBe(true)
    })

    it('VIEWER cannot write notification', async () => {
      const authorized = await service.authorize(
        viewerContext,
        'notification',
        'notif-123',
        'write'
      )

      expect(authorized).toBe(false)
    })

    it('denies access to notification from different org', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue({
        id: 'notif-123',
        organizationId: 'org-2', // Different org!
      })

      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-123',
        'read'
      )

      expect(authorized).toBe(false)
    })

    it('denies access when notification not found', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue(null)

      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-999',
        'read'
      )

      expect(authorized).toBe(false)
    })

    it('denies access on database error (fail closed)', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-123',
        'read'
      )

      expect(authorized).toBe(false)
    })
  })

  describe('authorize() - Template resource', () => {
    beforeEach(() => {
      ;(prisma.template.findUnique as jest.Mock).mockResolvedValue({
        id: 'template-123',
        organizationId: 'org-1',
      })
    })

    it('OWNER can delete template from their org', async () => {
      const authorized = await service.authorize(
        ownerContext,
        'template',
        'template-123',
        'delete'
      )

      expect(authorized).toBe(true)
      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: { id: 'template-123' },
        select: { organizationId: true },
      })
    })

    it('denies access to template from different org', async () => {
      ;(prisma.template.findUnique as jest.Mock).mockResolvedValue({
        id: 'template-123',
        organizationId: 'org-2',
      })

      const authorized = await service.authorize(
        ownerContext,
        'template',
        'template-123',
        'read'
      )

      expect(authorized).toBe(false)
    })
  })

  describe('authorize() - Price Alert resource', () => {
    beforeEach(() => {
      ;(prisma.priceAlert.findUnique as jest.Mock).mockResolvedValue({
        id: 'alert-123',
        organizationId: 'org-1',
      })
    })

    it('EDITOR can write price alert from their org', async () => {
      const authorized = await service.authorize(
        editorContext,
        'price_alert',
        'alert-123',
        'write'
      )

      expect(authorized).toBe(true)
      expect(prisma.priceAlert.findUnique).toHaveBeenCalledWith({
        where: { id: 'alert-123' },
        select: { organizationId: true },
      })
    })

    it('VIEWER cannot write price alert', async () => {
      const authorized = await service.authorize(
        viewerContext,
        'price_alert',
        'alert-123',
        'write'
      )

      expect(authorized).toBe(false)
    })
  })

  describe('authorize() - Watchlist resource', () => {
    beforeEach(() => {
      ;(prisma.watchlist.findUnique as jest.Mock).mockResolvedValue({
        id: 'watch-123',
        organizationId: 'org-1',
      })
    })

    it('EDITOR can read watchlist from their org', async () => {
      const authorized = await service.authorize(
        editorContext,
        'watchlist',
        'watch-123',
        'read'
      )

      expect(authorized).toBe(true)
      expect(prisma.watchlist.findUnique).toHaveBeenCalledWith({
        where: { id: 'watch-123' },
        select: { organizationId: true },
      })
    })
  })

  describe('Multi-tenant isolation', () => {
    it('user from org-1 cannot access notification from org-2', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue({
        id: 'notif-123',
        organizationId: 'org-2',
      })

      const org1Context: AuthorizationContext = {
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'OWNER',
      }

      const authorized = await service.authorize(
        org1Context,
        'notification',
        'notif-123',
        'read'
      )

      expect(authorized).toBe(false)
    })

    it('validates organization ID before checking permissions', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue({
        id: 'notif-123',
        organizationId: 'org-2', // Different org
      })

      // Even though OWNER has delete permission,
      // should be denied because org doesn't match
      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-123',
        'delete'
      )

      expect(authorized).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('handles undefined resource gracefully', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue(undefined)

      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-undefined',
        'read'
      )

      expect(authorized).toBe(false)
    })

    it('fails closed on unknown errors', async () => {
      ;(prisma.notification.findUnique as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      )

      const authorized = await service.authorize(
        ownerContext,
        'notification',
        'notif-error',
        'read'
      )

      // Should fail closed (deny) on errors
      expect(authorized).toBe(false)
    })
  })
})
