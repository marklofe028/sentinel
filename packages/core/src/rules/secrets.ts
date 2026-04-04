import type { Rule, Issue, ScanContext } from '../types/index.js'

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'Stripe live key',      pattern: /sk_live_[a-zA-Z0-9]{24,}/ },
  { name: 'GitHub PAT',           pattern: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'AWS access key',       pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'Anthropic API key',    pattern: /sk-ant-[a-zA-Z0-9\-]{32,}/ },
  { name: 'Generic bearer token', pattern: /bearer\s+[a-zA-Z0-9\-_.]{32,}/i },
]

export const secretsRule: Rule = {
  id: 'secrets:hardcoded',
  name: 'Hardcoded secrets in source',
  tier: 3,
  check(ctx: ScanContext): Issue[] {
    const issues: Issue[] = []
    for (const [filepath, content] of Object.entries(ctx.files)) {
      if (filepath.endsWith('.env') || filepath.includes('node_modules')) continue
      for (const { name, pattern } of SECRET_PATTERNS) {
        const match = content.match(pattern)
        if (match) {
          issues.push({
            id: `secrets:hardcoded:${filepath}:${name}`,
            severity: 'critical',
            tier: 3,
            title: `${name} detected in source file`,
            detail: `${filepath} contains what looks like a ${name}: "${match[0].slice(0, 12)}..."`,
            fix: 'Move to .env and add .env to .gitignore. Rotate the key immediately if already committed.',
            file: filepath,
          })
        }
      }
    }
    return issues
  }
}
