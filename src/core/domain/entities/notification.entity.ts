import {
  Channel,
  ErrorCategory,
  NotificationStatus,
  NotificationType,
  Priority,
} from '@prisma/client'

import { BaseEntity } from './base.entity'

export interface NotificationProps {
  id: string
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  templateId?: string
  status: NotificationStatus
  priority: Priority
  payload: Record<string, unknown>
  idempotencyKey?: string
  correlationId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  deliveredAt?: Date
  failedAt?: Date
  retryCount: number
  maxRetries: number
  lastError?: string
  errorCategory?: ErrorCategory
}

export class Notification extends BaseEntity<string> {
  private props: NotificationProps

  constructor(props: NotificationProps) {
    super(props.id, props.createdAt, props.updatedAt)
    this.props = props
  }

  // Getters
  get organizationId(): string {
    return this.props.organizationId
  }

  get userId(): string {
    return this.props.userId
  }

  get type(): NotificationType {
    return this.props.type
  }

  get channel(): Channel {
    return this.props.channel
  }

  get status(): NotificationStatus {
    return this.props.status
  }

  get payload(): Record<string, unknown> {
    return this.props.payload
  }

  get retryCount(): number {
    return this.props.retryCount
  }

  get maxRetries(): number {
    return this.props.maxRetries
  }

  get correlationId(): string | undefined {
    return this.props.correlationId
  }

  // Business logic methods
  canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === 'FAILED'
  }

  markAsSent(): void {
    this.props.status = 'SENT'
    this.props.sentAt = new Date()
    this.touch()
  }

  markAsFailed(error: string, category?: ErrorCategory): void {
    this.props.status = 'FAILED'
    this.props.failedAt = new Date()
    this.props.lastError = error
    this.props.errorCategory = category
    this.props.retryCount += 1
    this.touch()
  }

  markAsDelivered(): void {
    this.props.status = 'DELIVERED'
    this.props.deliveredAt = new Date()
    this.touch()
  }

  markAsProcessing(): void {
    this.props.status = 'PROCESSING'
    this.touch()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Notification)) return false
    return this.id === other.id
  }

  // Factory method
  static create(
    props: Omit<NotificationProps, 'createdAt' | 'updatedAt'>
  ): Notification {
    return new Notification({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}
