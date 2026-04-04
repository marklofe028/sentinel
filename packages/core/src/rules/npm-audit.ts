// packages/core/src/rules/npm-audit.ts

import type { Issue, ScanContext } from '../types/index.js'

interface NpmAdvisory {
    id: number
    module_name: string
    title: string
    severity: string
    overview: string
    patched_versions: string
    findings: Array<{ version: string }>
}

interface NpmAuditResponse {
    advisories: Record<string, NpmAdvisory>
}

export async function runNpmAudit(ctx: ScanContext): Promise<Issue[]> {
    if (!ctx.packageJson) return []

    const deps = {
        ...((ctx.packageJson.dependencies as Record<string, string>) ?? {}),
        ...((ctx.packageJson.devDependencies as Record<string, string>) ?? {}),
    }

    if (Object.keys(deps).length === 0) return []

    try {
        const response = await fetch('https://registry.npmjs.org/-/npm/v1/security/audits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: (ctx.packageJson.name as string) ?? 'project',
                version: '0.0.1',
                requires: deps,
                dependencies: {},
            }),
        })

        if (!response.ok) return []

        const data = await response.json() as NpmAuditResponse
        const issues: Issue[] = []

        for (const advisory of Object.values(data.advisories ?? {})) {
            const severity = advisory.severity === 'critical' || advisory.severity === 'high'
                ? 'critical' : advisory.severity === 'moderate'
                    ? 'warning' : 'advisory'

            const tier = severity === 'critical' ? 3 : severity === 'warning' ? 2 : 1

            const installedVersion = advisory.findings?.[0]?.version ?? 'unknown'

            issues.push({
                id: `npm-audit:${advisory.id}`,
                severity,
                tier: tier as 1 | 2 | 3,
                title: `${advisory.module_name}: ${advisory.title}`,
                detail: `${advisory.module_name}@${installedVersion} — ${advisory.overview}`,
                fix: `Upgrade to a patched version (${advisory.patched_versions}): pnpm add ${advisory.module_name}@latest`,
            })
        }

        return issues
    } catch {
        // fail silently — don't block the audit if npm registry is unreachable
        return []
    }
}