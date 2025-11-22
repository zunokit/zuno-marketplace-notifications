// Mock nanoid to avoid ESM issues
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-nanoid-123'),
}))

import { NotificationId } from '@/core/domain/value-objects/notification-id.vo'
import { nanoid } from 'nanoid'

describe('NotificationId Value Object', () => {
  describe('create', () => {
    it('should create a new notification id', () => {
      const id = NotificationId.create()
      expect(id).toBeInstanceOf(NotificationId)
      expect(id.toString()).toBeTruthy()
      expect(id.toString().length).toBeGreaterThan(0)
      expect(nanoid).toHaveBeenCalled()
    })

    it('should create unique ids', () => {
      ;(nanoid as jest.Mock).mockReturnValueOnce('id-1')
      ;(nanoid as jest.Mock).mockReturnValueOnce('id-2')

      const id1 = NotificationId.create()
      const id2 = NotificationId.create()
      expect(id1.toString()).not.toBe(id2.toString())
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('from', () => {
    it('should create from valid string', () => {
      const value = 'test-notification-id-123'
      const id = NotificationId.from(value)
      expect(id.toString()).toBe(value)
    })

    it('should reject empty string', () => {
      expect(() => NotificationId.from('')).toThrow('NotificationId cannot be empty')
    })

    it('should reject whitespace-only string', () => {
      expect(() => NotificationId.from('   ')).toThrow('NotificationId cannot be empty')
    })

    it('should reject null/undefined values', () => {
      expect(() => NotificationId.from(null as any)).toThrow('NotificationId cannot be empty')
      expect(() => NotificationId.from(undefined as any)).toThrow('NotificationId cannot be empty')
    })
  })

  describe('toString', () => {
    it('should return the underlying value', () => {
      const value = 'test-id-456'
      const id = NotificationId.from(value)
      expect(id.toString()).toBe(value)
    })
  })

  describe('equals', () => {
    it('should return true for equal ids', () => {
      const value = 'same-id'
      const id1 = NotificationId.from(value)
      const id2 = NotificationId.from(value)
      expect(id1.equals(id2)).toBe(true)
    })

    it('should return false for different ids', () => {
      const id1 = NotificationId.from('id-1')
      const id2 = NotificationId.from('id-2')
      expect(id1.equals(id2)).toBe(false)
    })
  })
})
