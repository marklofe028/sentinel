import type { Rule, Issue, ScanContext } from '../types/index.js'

export const environmentRule: Rule = {
  id: 'environment',
  name: 'Environment hygiene',
  tier: 2,
  check(ctx: ScanContext): Issue[] {
    const issues: Issue[] = []
    const filenames = Object.keys(ctx.files)
    const content = Object.entries(ctx.files)

    // DEBUG=True in any non-.env file
    for (const [filepath, text] of content) {
      if (filepath.includes('node_modules')) continue
      if (/DEBUG\s*=\s*true/i.test(text) && !filepath.endsWith('.env')) {
        issues.push({
          id: `environment:debug-in-source:${filepath}`,
          severity: 'warning',
          tier: 2,
          title: 'DEBUG=true found in source file',
          detail: `${filepath} has DEBUG=true hardcoded. This should live in .env only.`,
          fix: 'Move DEBUG flag to .env.development and read it via process.env.',
          file: filepath,
        })
      }
    }

    // .env present but not in .gitignore
    const hasEnvFile = filenames.some(f => f === '.env' || f.endsWith('/.env'))
    const gitignore = ctx.gitignore ?? []
    const envIgnored = gitignore.some(line => line.trim() === '.env' || line.trim() === '*.env')
    if (hasEnvFile && !envIgnored) {
      issues.push({
        id: 'environment:env-not-ignored',
        severity: 'critical',
        tier: 3,
        title: '.env file is not in .gitignore',
        detail: 'A .env file exists but .gitignore does not exclude it. It will be committed.',
        fix: 'Add .env to .gitignore immediately. If already committed, rotate all secrets inside it.',
      })
    }

    // .env.example missing
    const hasEnvExample = filenames.some(f => f.endsWith('.env.example'))
    if (!hasEnvExample) {
      issues.push({
        id: 'environment:missing-env-example',
        severity: 'advisory',
        tier: 1,
        title: 'No .env.example file found',
        detail: 'Other developers have no reference for required environment variables.',
        fix: 'Create .env.example with all required keys and placeholder values.',
      })
    }

    // NODE_ENV not set in production config
    const prodEnvContent = content.find(([f]) => f.includes('.env.production'))
    if (prodEnvContent) {
      const [filepath, text] = prodEnvContent
      if (!/NODE_ENV\s*=\s*production/i.test(text)) {
        issues.push({
          id: 'environment:node-env-not-set',
          severity: 'warning',
          tier: 2,
          title: 'NODE_ENV not set to production in .env.production',
          detail: `${filepath} exists but does not explicitly set NODE_ENV=production.`,
          fix: 'Add NODE_ENV=production to .env.production.',
          file: filepath,
        })
      }
    }

    return issues
  }
}
