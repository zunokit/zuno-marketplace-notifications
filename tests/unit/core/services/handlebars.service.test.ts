// Mock the environment config module
jest.mock('@/lib/config/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    RESEND_API_KEY: 'test-key',
    REDIS_URL: 'redis://localhost:6379',
    NODE_ENV: 'test',
    NEXTAUTH_URL: 'http://localhost:3000',
  },
}))

// Mock logger
jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

import { HandlebarsService } from '@/core/services/handlebars.service'

describe('HandlebarsService', () => {
  let service: HandlebarsService

  beforeEach(() => {
    service = new HandlebarsService()
  })

  describe('compile', () => {
    it('should compile a simple template', () => {
      const template = 'Hello {{name}}'
      expect(() => service.compile('test-1', template)).not.toThrow()
    })

    it('should compile a template with multiple variables', () => {
      const template = 'Hello {{firstName}} {{lastName}}, your balance is {{balance}}'
      expect(() => service.compile('test-2', template)).not.toThrow()
    })
  })

  describe('render', () => {
    it('should render a simple template', () => {
      const template = 'Hello {{name}}'
      const result = service.render('test-render-1', template, { name: 'John' })
      expect(result).toBe('Hello John')
    })

    it('should render template with multiple variables', () => {
      const template = 'Hello {{firstName}} {{lastName}}'
      const result = service.render('test-render-2', template, {
        firstName: 'John',
        lastName: 'Doe',
      })
      expect(result).toBe('Hello John Doe')
    })

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{name}}'
      const result = service.render('test-render-3', template, {})
      expect(result).toBe('Hello ')
    })

    it('should render template with nested objects', () => {
      const template = 'Hello {{user.name}}, your email is {{user.email}}'
      const result = service.render('test-render-4', template, {
        user: { name: 'John', email: 'john@example.com' },
      })
      expect(result).toBe('Hello John, your email is john@example.com')
    })

    it('should use cached template on subsequent renders', () => {
      const template = 'Hello {{name}}'
      const compileSpy = jest.spyOn(service, 'compile')

      // First render
      service.render('test-cache-1', template, { name: 'John' })
      expect(compileSpy).toHaveBeenCalledTimes(1)

      // Second render - should use cache
      service.render('test-cache-1', template, { name: 'Jane' })
      expect(compileSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('formatDate helper', () => {
    it('should format date correctly', () => {
      const template = 'Date: {{formatDate date}}'
      const result = service.render('test-date-1', template, {
        date: new Date('2024-01-15'),
      })
      expect(result).toContain('1/15/2024')
    })
  })

  describe('formatCurrency helper', () => {
    it('should format currency correctly', () => {
      const template = 'Price: {{formatCurrency price}}'
      const result = service.render('test-currency-1', template, { price: 99.99 })
      expect(result).toBe('Price: $99.99')
    })

    it('should format large amounts with commas', () => {
      const template = 'Price: {{formatCurrency price}}'
      const result = service.render('test-currency-2', template, { price: 1234567.89 })
      expect(result).toBe('Price: $1,234,567.89')
    })
  })

  describe('uppercase helper', () => {
    it('should convert string to uppercase', () => {
      const template = 'Message: {{uppercase text}}'
      const result = service.render('test-upper-1', template, { text: 'hello world' })
      expect(result).toBe('Message: HELLO WORLD')
    })
  })

  describe('lowercase helper', () => {
    it('should convert string to lowercase', () => {
      const template = 'Message: {{lowercase text}}'
      const result = service.render('test-lower-1', template, { text: 'HELLO WORLD' })
      expect(result).toBe('Message: hello world')
    })
  })

  describe('extractVariables', () => {
    it('should extract simple variables', () => {
      const template = 'Hello {{name}}, your email is {{email}}'
      const variables = service.extractVariables(template)
      expect(variables).toContain('name')
      expect(variables).toContain('email')
      expect(variables.length).toBe(2)
    })

    it('should extract nested variables', () => {
      const template = 'Hello {{user.name}}, balance: {{account.balance}}'
      const variables = service.extractVariables(template)
      expect(variables).toContain('user.name')
      expect(variables).toContain('account.balance')
    })

    it('should extract variables from conditional templates', () => {
      const template = '{{#if condition}}Hello{{/if}} {{name}}'
      const variables = service.extractVariables(template)
      // The extractVariables method extracts all variable-like patterns
      // Including block helpers like #if and /if
      expect(variables).toContain('name')
      // Block helpers might be included or excluded depending on implementation
      expect(variables.length).toBeGreaterThan(0)
    })

    it('should return empty array for template without variables', () => {
      const template = 'Hello World'
      const variables = service.extractVariables(template)
      expect(variables).toEqual([])
    })

    it('should not duplicate variables', () => {
      const template = 'Hello {{name}}, goodbye {{name}}'
      const variables = service.extractVariables(template)
      expect(variables.filter((v) => v === 'name').length).toBe(1)
    })
  })

  describe('validateVariables', () => {
    it('should return valid when all variables provided', () => {
      const template = 'Hello {{name}}, your email is {{email}}'
      const result = service.validateVariables(template, {
        name: 'John',
        email: 'john@example.com',
      })
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('should return invalid when variables missing', () => {
      const template = 'Hello {{name}}, your email is {{email}}'
      const result = service.validateVariables(template, { name: 'John' })
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('email')
    })

    it('should handle extra variables gracefully', () => {
      const template = 'Hello {{name}}'
      const result = service.validateVariables(template, {
        name: 'John',
        email: 'john@example.com',
        extra: 'value',
      })
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('should return all missing variables', () => {
      const template = 'Hello {{name}}, {{email}}, {{phone}}'
      const result = service.validateVariables(template, { name: 'John' })
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('email')
      expect(result.missing).toContain('phone')
      expect(result.missing.length).toBe(2)
    })
  })

  describe('clearCache', () => {
    it('should clear specific template from cache', () => {
      const template = 'Hello {{name}}'
      const compileSpy = jest.spyOn(service, 'compile')

      // Compile and cache
      service.render('test-clear-1', template, { name: 'John' })
      expect(compileSpy).toHaveBeenCalledTimes(1)

      // Clear cache for this template
      service.clearCache('test-clear-1')

      // Should recompile after cache clear
      service.render('test-clear-1', template, { name: 'Jane' })
      expect(compileSpy).toHaveBeenCalledTimes(2)
    })

    it('should clear all templates when no id provided', () => {
      const template1 = 'Hello {{name}}'
      const template2 = 'Goodbye {{name}}'
      const compileSpy = jest.spyOn(service, 'compile')

      // Compile and cache multiple templates
      service.render('test-clear-all-1', template1, { name: 'John' })
      service.render('test-clear-all-2', template2, { name: 'Jane' })
      expect(compileSpy).toHaveBeenCalledTimes(2)

      // Clear all cache
      service.clearCache()

      // Both should recompile
      service.render('test-clear-all-1', template1, { name: 'John' })
      service.render('test-clear-all-2', template2, { name: 'Jane' })
      expect(compileSpy).toHaveBeenCalledTimes(4)
    })
  })

  describe('complex templates', () => {
    it('should handle templates with conditionals', () => {
      const template = '{{#if isPremium}}Premium User{{else}}Regular User{{/if}}'
      const result1 = service.render('test-cond-1', template, { isPremium: true })
      const result2 = service.render('test-cond-2', template, { isPremium: false })
      expect(result1).toBe('Premium User')
      expect(result2).toBe('Regular User')
    })

    it('should handle templates with loops', () => {
      const template = 'Items: {{#each items}}{{this}} {{/each}}'
      const result = service.render('test-loop-1', template, {
        items: ['apple', 'banana', 'orange'],
      })
      expect(result).toBe('Items: apple banana orange ')
    })

    it('should handle combined helpers and variables', () => {
      const template =
        'Hello {{uppercase name}}, your balance is {{formatCurrency balance}}'
      const result = service.render('test-combined-1', template, {
        name: 'john',
        balance: 1500.5,
      })
      expect(result).toBe('Hello JOHN, your balance is $1,500.50')
    })
  })
})
