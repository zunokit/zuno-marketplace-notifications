import { BaseEntity } from '@/core/domain/entities/base.entity'

// Create a concrete implementation for testing
class TestEntity extends BaseEntity<string> {
  private name: string

  constructor(id: string, name: string, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt)
    this.name = name
  }

  getName(): string {
    return this.name
  }

  setName(name: string): void {
    this.name = name
    this.touch()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TestEntity)) {
      return false
    }
    return this.id === other.id
  }
}

describe('BaseEntity', () => {
  describe('constructor', () => {
    it('should create entity with id', () => {
      const entity = new TestEntity('test-id', 'Test')
      expect(entity.id).toBe('test-id')
    })

    it('should set default createdAt to current time', () => {
      const before = new Date()
      const entity = new TestEntity('test-id', 'Test')
      const after = new Date()

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should set default updatedAt to current time', () => {
      const before = new Date()
      const entity = new TestEntity('test-id', 'Test')
      const after = new Date()

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should accept custom createdAt', () => {
      const customDate = new Date('2024-01-01')
      const entity = new TestEntity('test-id', 'Test', customDate)
      expect(entity.createdAt).toBe(customDate)
    })

    it('should accept custom updatedAt', () => {
      const customCreatedAt = new Date('2024-01-01')
      const customUpdatedAt = new Date('2024-01-15')
      const entity = new TestEntity('test-id', 'Test', customCreatedAt, customUpdatedAt)
      expect(entity.updatedAt).toBe(customUpdatedAt)
    })
  })

  describe('id getter', () => {
    it('should return the entity id', () => {
      const entity = new TestEntity('my-id', 'Test')
      expect(entity.id).toBe('my-id')
    })

    it('should work with different id types', () => {
      class NumericEntity extends BaseEntity<number> {
        equals(other: unknown): boolean {
          return other instanceof NumericEntity && this.id === other.id
        }
      }

      const entity = new NumericEntity(123)
      expect(entity.id).toBe(123)
    })
  })

  describe('createdAt getter', () => {
    it('should return the creation date', () => {
      const createdDate = new Date('2024-01-01')
      const entity = new TestEntity('test-id', 'Test', createdDate)
      expect(entity.createdAt).toBe(createdDate)
    })

    it('should be immutable', () => {
      const entity = new TestEntity('test-id', 'Test')
      const originalCreatedAt = entity.createdAt

      // Attempt to modify (won't work due to readonly)
      expect(entity.createdAt).toBe(originalCreatedAt)
    })
  })

  describe('updatedAt getter', () => {
    it('should return the last update date', () => {
      const updatedDate = new Date('2024-01-15')
      const entity = new TestEntity('test-id', 'Test', new Date(), updatedDate)
      expect(entity.updatedAt).toBe(updatedDate)
    })
  })

  describe('touch method', () => {
    it('should update the updatedAt timestamp', async () => {
      const initialDate = new Date('2024-01-01')
      const entity = new TestEntity('test-id', 'Test', initialDate, initialDate)

      // Wait a bit to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      entity.setName('New Name') // This calls touch()

      expect(entity.updatedAt.getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should set updatedAt to current time', async () => {
      const oldDate = new Date('2024-01-01')
      const entity = new TestEntity('test-id', 'Test', oldDate, oldDate)

      const before = new Date()
      entity.setName('Updated')
      const after = new Date()

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should not modify createdAt', () => {
      const createdDate = new Date('2024-01-01')
      const entity = new TestEntity('test-id', 'Test', createdDate)

      entity.setName('Updated')

      expect(entity.createdAt).toBe(createdDate)
    })
  })

  describe('equals method', () => {
    it('should return true for entities with same id', () => {
      const entity1 = new TestEntity('same-id', 'Name1')
      const entity2 = new TestEntity('same-id', 'Name2')

      expect(entity1.equals(entity2)).toBe(true)
    })

    it('should return false for entities with different id', () => {
      const entity1 = new TestEntity('id-1', 'Name')
      const entity2 = new TestEntity('id-2', 'Name')

      expect(entity1.equals(entity2)).toBe(false)
    })

    it('should return false for non-entity objects', () => {
      const entity = new TestEntity('test-id', 'Name')

      expect(entity.equals({ id: 'test-id' })).toBe(false)
      expect(entity.equals('test-id')).toBe(false)
      expect(entity.equals(null)).toBe(false)
      expect(entity.equals(undefined)).toBe(false)
    })
  })

  describe('timestamps consistency', () => {
    it('should have createdAt before or equal to updatedAt on creation', () => {
      const entity = new TestEntity('test-id', 'Test')
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(entity.updatedAt.getTime())
    })

    it('should have updatedAt after createdAt after modifications', async () => {
      const createdDate = new Date('2024-01-01')
      const entity = new TestEntity('test-id', 'Test', createdDate, createdDate)

      await new Promise((resolve) => setTimeout(resolve, 10))
      entity.setName('Modified')

      expect(entity.updatedAt.getTime()).toBeGreaterThan(entity.createdAt.getTime())
    })
  })
})
