import { describe, it, expect } from 'vitest'
import { secretsRule } from './secrets.js'

describe('secretsRule', () => {
  it('detects a hardcoded Stripe live key', () => {
    const fakeKey = ['sk_live', 'abcdefghijklmnopqrstuvwx'].join('_')
    const ctx = {
      files: { 'src/config.ts': `const key = "${fakeKey}"` },
      env: {},
    }
    const issues = secretsRule.check(ctx)
    expect(issues).toHaveLength(1)
    expect(issues[0].tier).toBe(3)
    expect(issues[0].severity).toBe('critical')
  })

  it('ignores .env files', () => {
    const fakeKey = ['sk_live', 'abcdefghijklmnopqrstuvwx'].join('_')
    const ctx = {
      files: { '.env': `STRIPE_KEY=${fakeKey}` },
      env: {},
    }
    const issues = secretsRule.check(ctx)
    expect(issues).toHaveLength(0)
  })
})
