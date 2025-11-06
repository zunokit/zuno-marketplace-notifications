export abstract class BaseEntity<T> {
  protected readonly _id: T
  protected readonly _createdAt: Date
  protected _updatedAt: Date

  constructor(id: T, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
    this._id = id
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  get id(): T {
    return this._id
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  protected touch(): void {
    this._updatedAt = new Date()
  }

  abstract equals(other: unknown): boolean
}
