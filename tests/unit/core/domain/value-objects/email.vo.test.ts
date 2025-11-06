import { Email } from '@/core/domain/value-objects/email.vo'

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = Email.create('test@example.com')
    expect(email.toString()).toBe('test@example.com')
  })

  it('should normalize email to lowercase', () => {
    const email = Email.create('TEST@EXAMPLE.COM')
    expect(email.toString()).toBe('test@example.com')
  })

  it('should trim whitespace', () => {
    const email = Email.create('  test@example.com  ')
    expect(email.toString()).toBe('test@example.com')
  })

  it('should reject invalid email', () => {
    expect(() => Email.create('invalid-email')).toThrow('Invalid email')
    expect(() => Email.create('test@')).toThrow('Invalid email')
    expect(() => Email.create('@example.com')).toThrow('Invalid email')
  })

  it('should check equality', () => {
    const email1 = Email.create('test@example.com')
    const email2 = Email.create('TEST@EXAMPLE.COM')
    const email3 = Email.create('other@example.com')

    expect(email1.equals(email2)).toBe(true)
    expect(email1.equals(email3)).toBe(false)
  })
})
