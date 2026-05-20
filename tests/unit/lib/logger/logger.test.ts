jest.mock('@/lib/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'info',
  },
}))

import { createContextLogger, logger } from '@/lib/logger/logger'

describe('createContextLogger', () => {
  let debugSpy: jest.SpyInstance
  let infoSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    debugSpy = jest.spyOn(logger, 'debug').mockImplementation(() => logger)
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => logger)
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => logger)
    errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => logger)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('forwards info() to the underlying winston logger with correlationId attached', () => {
    const ctx = createContextLogger('corr_abc')
    ctx.info('hello')
    expect(infoSpy).toHaveBeenCalledWith('hello', { correlationId: 'corr_abc' })
  })

  it('merges extra meta on top of correlationId for info()', () => {
    const ctx = createContextLogger('corr_abc')
    ctx.info('hello', { userId: 'u-1' })
    expect(infoSpy).toHaveBeenCalledWith('hello', {
      correlationId: 'corr_abc',
      userId: 'u-1',
    })
  })

  it.each([
    ['debug', () => debugSpy],
    ['warn', () => warnSpy],
    ['error', () => errorSpy],
  ] as const)('forwards %s() with correlationId + meta', (level, spyGetter) => {
    const ctx = createContextLogger('corr_xyz')
    ctx[level]('msg', { extra: 1 })
    expect(spyGetter()).toHaveBeenCalledWith('msg', {
      correlationId: 'corr_xyz',
      extra: 1,
    })
  })

  it('does not mutate the input meta object', () => {
    const meta = { userId: 'u-1' }
    const before = { ...meta }
    const ctx = createContextLogger('corr_abc')
    ctx.info('hello', meta)
    expect(meta).toEqual(before)
  })

  it('lets explicit correlationId in meta override the bound one', () => {
    // Implementation does `{ correlationId, ...meta }`, so a correlationId in
    // meta overrides the bound one - pin that behavior so future refactors
    // don't silently change it.
    const ctx = createContextLogger('corr_outer')
    ctx.info('hello', { correlationId: 'corr_inner' })
    expect(infoSpy).toHaveBeenCalledWith('hello', {
      correlationId: 'corr_inner',
    })
  })
})

describe('logger', () => {
  it('exposes debug/info/warn/error functions', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })
})
