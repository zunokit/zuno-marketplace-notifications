import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge simple class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toBe('base active')
  })

  it('should filter out falsy values', () => {
    const result = cn('base', false, null, undefined, 'valid')
    expect(result).toBe('base valid')
  })

  it('should merge tailwind classes correctly', () => {
    // Tailwind merge should handle conflicting utility classes
    const result = cn('p-4', 'p-8')
    expect(result).toBe('p-8') // Later class should win
  })

  it('should handle array inputs', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
    expect(result).toContain('class3')
  })

  it('should handle object inputs with conditions', () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    })
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle complex nested structures', () => {
    const result = cn(
      'base',
      ['nested', { conditional: true }],
      {
        'another-class': true,
        'skipped-class': false,
      }
    )
    expect(result).toContain('base')
    expect(result).toContain('nested')
    expect(result).toContain('conditional')
    expect(result).toContain('another-class')
    expect(result).not.toContain('skipped-class')
  })

  it('should merge tailwind conflicting width classes', () => {
    const result = cn('w-4', 'w-8')
    expect(result).toBe('w-8')
  })

  it('should merge tailwind conflicting color classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should preserve non-conflicting tailwind classes', () => {
    const result = cn('p-4', 'm-2', 'text-red-500')
    expect(result).toContain('p-4')
    expect(result).toContain('m-2')
    expect(result).toContain('text-red-500')
  })

  it('should handle dynamic button variants', () => {
    const variant = 'primary' as 'primary' | 'secondary'
    const size = 'large' as 'small' | 'large'

    const result = cn(
      'button',
      {
        'bg-blue-500': variant === 'primary',
        'bg-gray-500': variant === 'secondary',
      },
      {
        'px-4 py-2': size === 'small',
        'px-6 py-3': size === 'large',
      }
    )

    expect(result).toContain('button')
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('px-6')
    expect(result).toContain('py-3')
    expect(result).not.toContain('bg-gray-500')
    expect(result).not.toContain('px-4')
  })

  it('should handle whitespace correctly', () => {
    const result = cn('  class1  ', '  class2  ')
    expect(result.trim()).toBeTruthy()
  })
})
