import { describe, it, expect } from 'vitest'
import { environmentRule } from './environment.js'

describe('environmentRule', () => {
  it('flags DEBUG=true in a source file', () => {
    const issues = environmentRule.check({
      files: { 'src/app.ts': 'const x = 1\nDEBUG=true\n' },
      env: {},
    })
    expect(issues.some(i => i.id.includes('debug-in-source'))).toBe(true)
  })

  it('flags .env not in .gitignore', () => {
    const issues = environmentRule.check({
      files: { '.env': 'SECRET=abc' },
      env: {},
      gitignore: [],
    })
    expect(issues.some(i => i.id === 'environment:env-not-ignored')).toBe(true)
  })

  it('flags missing .env.example', () => {
    const issues = environmentRule.check({ files: {}, env: {} })
    expect(issues.some(i => i.id === 'environment:missing-env-example')).toBe(true)
  })

  it('passes when .env is gitignored', () => {
    const issues = environmentRule.check({
      files: { '.env': 'SECRET=abc', '.env.example': 'SECRET=' },
      env: {},
      gitignore: ['.env'],
    })
    expect(issues.some(i => i.id === 'environment:env-not-ignored')).toBe(false)
  })
})
