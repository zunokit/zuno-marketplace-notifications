import { Notification } from '@/core/domain/entities/notification.entity'

describe('Notification Entity', () => {
  it('should create a notification', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: { name: 'John' },
      retryCount: 0,
      maxRetries: 5,
    })

    expect(notification.id).toBe('123')
    expect(notification.status).toBe('PENDING')
    expect(notification.type).toBe('WELCOME')
  })

  it('should mark notification as sent', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    notification.markAsSent()

    expect(notification.status).toBe('SENT')
  })

  it('should check if notification can retry', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'FAILED',
      priority: 'NORMAL',
      payload: {},
      retryCount: 3,
      maxRetries: 5,
    })

    expect(notification.canRetry()).toBe(true)

    // Exceed max retries
    notification.markAsFailed('Error')
    notification.markAsFailed('Error')
    notification.markAsFailed('Error')

    expect(notification.canRetry()).toBe(false)
  })

  it('should mark notification as failed with error', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PROCESSING',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    notification.markAsFailed('Network error', 'NETWORK_ERROR')

    expect(notification.status).toBe('FAILED')
    expect(notification.retryCount).toBe(1)
  })

  it('should mark notification as delivered', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'SENT',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    notification.markAsDelivered()

    expect(notification.status).toBe('DELIVERED')
  })

  it('should check equality based on ID', () => {
    const notification1 = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    const notification2 = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    const notification3 = Notification.create({
      id: '456',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    expect(notification1.equals(notification2)).toBe(true)
    expect(notification1.equals(notification3)).toBe(false)
  })
})
