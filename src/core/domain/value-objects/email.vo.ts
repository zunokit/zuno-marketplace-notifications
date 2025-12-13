export class Email {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(email: string): Email {
    const trimmed = email.trim()
    if (!Email.isValid(trimmed)) {
      throw new Error(`Invalid email: ${trimmed}`)
    }
    return new Email(trimmed.toLowerCase())
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  toString(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
