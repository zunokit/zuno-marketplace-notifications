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

  it('should mark notification as failed', () => {
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

    notification.markAsFailed('Test error')

    expect(notification.status).toBe('FAILED')
    expect(notification.retryCount).toBe(1)
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
    notification.markAsFailed('Error 1')
    notification.markAsFailed('Error 2')
    notification.markAsFailed('Error 3')

    expect(notification.canRetry()).toBe(false)
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
})
