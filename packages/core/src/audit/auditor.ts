import type { AuditResult, ScanContext, Environment, Rule } from '../types/index.js'
import { secretsRule }      from '../rules/secrets.js'
import { environmentRule }  from '../rules/environment.js'
import { dependenciesRule } from '../rules/dependencies.js'
import { deploymentRule }   from '../rules/deployment.js'
import { runOsvAudit }      from '../rules/osv-audit.js'

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
  const [staticIssues, osvIssues] = await Promise.all([
    Promise.resolve(ALL_RULES.flatMap(rule => rule.check(ctx))),
    runOsvAudit(ctx),
  ])

  // deduplicate — if osv and static both catch the same package,
  // keep the osv result as it has more detail
  const osvIds = new Set(osvIssues.map(i => {
    const parts = i.id.split(':')
    return parts[2] // package name
  }))

  const filteredStatic = staticIssues.filter(i => {
    if (!i.id.startsWith('dependencies:cve:')) return true
    const pkgName = i.id.replace('dependencies:cve:', '')
    return !osvIds.has(pkgName)
  })

  const allIssues = [...filteredStatic, ...osvIssues]

  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const warningCount  = allIssues.filter(i => i.severity === 'warning').length
  const advisoryCount = allIssues.filter(i => i.severity === 'advisory').length

  const score = Math.max(
    0,
    100 - (criticalCount * 25) - (warningCount * 10) - (advisoryCount * 3)
  )

  return {
    score,
    issues: allIssues,
    passedChecks: ALL_RULES.length - new Set(
      allIssues.map(i => i.id.split(':')[0])
    ).size,
    timestamp: new Date(),
    env,
  }
}
