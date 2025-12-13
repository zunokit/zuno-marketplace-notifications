import Handlebars from 'handlebars'

import { logger } from '@/lib/logger/logger'

export interface TemplateVariables {
  [key: string]: unknown
}

/**
 * Low-level Handlebars template rendering service
 * Provides template compilation, rendering, and variable extraction utilities
 */
export class HandlebarsService {
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate>

  constructor() {
    this.compiledTemplates = new Map()
    this.registerHelpers()
  }

  private registerHelpers(): void {
    // Register custom Handlebars helpers
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString()
    })

    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    })

    Handlebars.registerHelper('uppercase', (str: string) => {
      return str.toUpperCase()
    })

    Handlebars.registerHelper('lowercase', (str: string) => {
      return str.toLowerCase()
    })
  }

  compile(templateId: string, template: string): void {
    try {
      const compiled = Handlebars.compile(template)
      this.compiledTemplates.set(templateId, compiled)

      logger.info('HandlebarsService: Template compiled', { templateId })
    } catch (error) {
      logger.error('HandlebarsService: Compilation error', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw new Error(`Template compilation failed: ${error}`)
    }
  }

  render(
    templateId: string,
    template: string,
    variables: TemplateVariables
  ): string {
    try {
      // Check if template is already compiled
      let compiled = this.compiledTemplates.get(templateId)

      // If not compiled, compile it now
      if (!compiled) {
        this.compile(templateId, template)
        compiled = this.compiledTemplates.get(templateId)!
      }

      // Render template with variables
      const rendered = compiled(variables)

      logger.debug('HandlebarsService: Template rendered', {
        templateId,
        variableCount: Object.keys(variables).length,
      })

      return rendered
    } catch (error) {
      logger.error('HandlebarsService: Render error', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw new Error(`Template rendering failed: ${error}`)
    }
  }

  extractVariables(template: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const variables: Set<string> = new Set()

    let match
    while ((match = variableRegex.exec(template)) !== null) {
      // Remove handlebars helpers and whitespace
      const variable = match[1].trim().split(' ')[0]
      if (!['if', 'unless', 'each', 'with'].includes(variable)) {
        variables.add(variable)
      }
    }

    return Array.from(variables)
  }

  validateVariables(
    template: string,
    variables: TemplateVariables
  ): { valid: boolean; missing: string[] } {
    const requiredVariables = this.extractVariables(template)
    const providedVariables = Object.keys(variables)

    const missing = requiredVariables.filter(
      (v) => !providedVariables.includes(v)
    )

    return {
      valid: missing.length === 0,
      missing,
    }
  }

  clearCache(templateId?: string): void {
    if (templateId) {
      this.compiledTemplates.delete(templateId)
      logger.info('HandlebarsService: Cache cleared for template', { templateId })
    } else {
      this.compiledTemplates.clear()
      logger.info('HandlebarsService: All template cache cleared')
    }
  }
}
