import type { Rule, Issue, ScanContext } from '../types/index.js'

export const deploymentRule: Rule = {
  id: 'deployment',
  name: 'Deployment readiness',
  tier: 2,
  check(ctx: ScanContext): Issue[] {
    const issues: Issue[] = []
    const content = Object.entries(ctx.files)

    for (const [filepath, text] of content) {
      if (filepath.includes('node_modules')) continue

      // CORS wildcard
      if (/cors\(\s*\{\s*origin\s*:\s*['"`]\*['"`]/i.test(text) ||
          /Access-Control-Allow-Origin.*\*/i.test(text)) {
        issues.push({
          id: `deployment:cors-wildcard:${filepath}`,
          severity: 'warning',
          tier: 2,
          title: 'CORS wildcard origin detected',
          detail: `${filepath} allows requests from any origin (*). Dangerous in production.`,
          fix: 'Restrict CORS to your specific frontend domain: origin: process.env.ALLOWED_ORIGIN',
          file: filepath,
        })
      }

      // no rate limiting on auth routes
      if (/router\.(post|get)\s*\(\s*['"`]\/auth/i.test(text) ||
          /app\.(post|get)\s*\(\s*['"`]\/auth/i.test(text)) {
        if (!/rateLimit|rate.limit|express-rate-limit|slowDown/i.test(text)) {
          issues.push({
            id: `deployment:no-rate-limit:${filepath}`,
            severity: 'warning',
            tier: 2,
            title: 'Auth route has no rate limiting',
            detail: `${filepath} defines an /auth route without rate limiting — vulnerable to brute force.`,
            fix: 'Add express-rate-limit: app.use("/auth", rateLimit({ windowMs: 15*60*1000, max: 100 }))',
            file: filepath,
          })
        }
      }

      // missing security headers
      if (/(express\(\)|createServer|fastify\(\))/i.test(text)) {
        if (!/helmet/i.test(text)) {
          issues.push({
            id: `deployment:no-helmet:${filepath}`,
            severity: 'advisory',
            tier: 1,
            title: 'Security headers not set',
            detail: `${filepath} initializes a server without helmet — missing XSS, CSRF, and clickjacking protection.`,
            fix: 'Add helmet: import helmet from "helmet"; app.use(helmet())',
            file: filepath,
          })
        }
      }

      // hardcoded localhost in non-dev files
      if (!/\.dev\.|\.test\.|\.spec\./.test(filepath)) {
        if (/['"`]https?:\/\/localhost/i.test(text)) {
          issues.push({
            id: `deployment:hardcoded-localhost:${filepath}`,
            severity: 'advisory',
            tier: 1,
            title: 'Hardcoded localhost URL in source',
            detail: `${filepath} contains a hardcoded localhost URL — will break in staging and production.`,
            fix: 'Replace with process.env.API_URL and set the value per environment in .env files.',
            file: filepath,
          })
        }
      }
    }

    return issues
  }
}
