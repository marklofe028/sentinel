import type { Rule, Issue, ScanContext } from '../types/index.js'

const KNOWN_VULNERABLE: Record<string, { below: string; cve: string; severity: 'warning' | 'critical' }> = {
  'lodash': { below: '4.17.21', cve: 'CVE-2021-23337', severity: 'critical' },
  'axios': { below: '1.6.0', cve: 'CVE-2023-45857', severity: 'warning' },
  'express': { below: '4.19.0', cve: 'CVE-2024-29041', severity: 'warning' },
  'jsonwebtoken': { below: '9.0.0', cve: 'CVE-2022-23529', severity: 'critical' },
  'node-fetch': { below: '3.0.0', cve: 'CVE-2022-0235', severity: 'warning' },
  'minimist': { below: '1.2.6', cve: 'CVE-2021-44906', severity: 'warning' },
}

function parseVersion(v: string): number[] {
  return v
    .replaceAll('^', '').replaceAll('~', '')
    .replaceAll('>', '').replaceAll('=', '')
    .replaceAll('<', '').split('.').map(Number)
}

function isBelow(installed: string, threshold: string): boolean {
  const a = parseVersion(installed)
  const b = parseVersion(threshold)
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) < (b[i] ?? 0)) return true
    if ((a[i] ?? 0) > (b[i] ?? 0)) return false
  }
  return false
}

export const dependenciesRule: Rule = {
  id: 'dependencies',
  name: 'Dependency safety',
  tier: 2,
  check(ctx: ScanContext): Issue[] {
    const issues: Issue[] = []
    const pkg = ctx.packageJson
    if (!pkg) return issues

    const deps = {
      ...((pkg.dependencies as Record<string, string>) ?? {}),
      ...((pkg.devDependencies as Record<string, string>) ?? {}),
    }

    for (const [name, version] of Object.entries(deps)) {
      // unpinned version check
      if (version.startsWith('^') || version.startsWith('~') || version === '*') {
        issues.push({
          id: `dependencies:unpinned:${name}`,
          severity: 'advisory',
          tier: 1,
          title: `Unpinned dependency: ${name}`,
          detail: `${name}@${version} uses a range — a future patch could introduce a breaking change or vulnerability.`,
          fix: `Pin to an exact version: "${name}": "${version.replaceAll('^', '').replaceAll('~', '').replaceAll('*', '')}"`,
        })
      }

      // static CVE fallback
      if (name in KNOWN_VULNERABLE) {
        const record = KNOWN_VULNERABLE[name]
        const cleanVersion = version
          .replaceAll('^', '').replaceAll('~', '')
          .replaceAll('>', '').replaceAll('=', '').replaceAll('<', '')
        if (isBelow(cleanVersion, record.below)) {
          issues.push({
            id: `dependencies:cve:${name}`,
            severity: record.severity,
            tier: 2,
            title: `${name}@${cleanVersion} has a known CVE`,
            detail: `${record.cve} — affects versions below ${record.below}. Currently installed: ${cleanVersion}.`,
            fix: `Upgrade: pnpm add ${name}@latest`,
          })
        }
      }

      // node_modules committed check
      const hasCommittedModules = Object.keys(ctx.files).some(f =>
        f.startsWith('node_modules/') || f.includes('/node_modules/')
      )
      if (hasCommittedModules) {
        issues.push({
          id: 'dependencies:node-modules-committed',
          severity: 'critical',
          tier: 3,
          title: 'node_modules committed to version control',
          detail: 'node_modules should never be in git.',
          fix: 'Add node_modules/ to .gitignore and run: git rm -r --cached node_modules',
        })
      }
    }

    return issues
  }
}