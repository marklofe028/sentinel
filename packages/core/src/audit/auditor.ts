import type { AuditResult, ScanContext, Environment, Rule } from '../types/index.js'
import { secretsRule }     from '../rules/secrets.js'
import { environmentRule } from '../rules/environment.js'
import { dependenciesRule } from '../rules/dependencies.js'
import { deploymentRule }  from '../rules/deployment.js'

const ALL_RULES: Rule[] = [
  secretsRule,
  environmentRule,
  dependenciesRule,
  deploymentRule,
]

export async function runAudit(
  ctx: ScanContext,
  env: Environment = 'development'
): Promise<AuditResult> {
  const allIssues = ALL_RULES.flatMap(rule => rule.check(ctx))
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const warningCount  = allIssues.filter(i => i.severity === 'warning').length
  const advisoryCount = allIssues.filter(i => i.severity === 'advisory').length
  const score = Math.max(0,
    100 - (criticalCount * 25) - (warningCount * 10) - (advisoryCount * 3)
  )
  return {
    score,
    issues: allIssues,
    passedChecks: ALL_RULES.length - new Set(allIssues.map(i => i.id.split(':')[0])).size,
    timestamp: new Date(),
    env,
  }
}
