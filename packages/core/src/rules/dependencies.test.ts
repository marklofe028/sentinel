import { describe, it, expect } from 'vitest'
import { dependenciesRule } from './dependencies.js'

describe('dependenciesRule', () => {
  it('flags a known vulnerable lodash version', () => {
    const issues = dependenciesRule.check({
      files: {},
      env: {},
      packageJson: { dependencies: { lodash: '4.17.20' } },
    })
    expect(issues.some(i => i.id === 'dependencies:cve:lodash')).toBe(true)
  })

  it('passes a safe lodash version', () => {
    const issues = dependenciesRule.check({
      files: {},
      env: {},
      packageJson: { dependencies: { lodash: '4.17.21' } },
    })
    expect(issues.some(i => i.id === 'dependencies:cve:lodash')).toBe(false)
  })

  it('flags an unpinned dependency', () => {
    const issues = dependenciesRule.check({
      files: {},
      env: {},
      packageJson: { dependencies: { express: '^4.19.0' } },
    })
    expect(issues.some(i => i.id === 'dependencies:unpinned:express')).toBe(true)
  })
})
