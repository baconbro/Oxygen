import { describe, it, expect } from 'vitest'
import { env } from '../../utils/env'

describe('Environment Configuration', () => {
  it('should have default i18n config key', () => {
    expect(env.i18nConfigKey).toBe('i18nConfig')
  })

  it('should have default layout config key', () => {
    expect(env.layoutConfigKey).toBe('LayoutConfig')
  })

  it('should have firebase configuration object', () => {
    expect(env.firebase).toBeDefined()
    expect(typeof env.firebase).toBe('object')
  })

  it('should have isDevelopment and isProduction flags', () => {
    expect(typeof env.isDevelopment).toBe('boolean')
    expect(typeof env.isProduction).toBe('boolean')
  })

  it('should have a mode property', () => {
    expect(env.mode).toBeDefined()
    expect(typeof env.mode).toBe('string')
  })
})
