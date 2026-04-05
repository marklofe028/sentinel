import type { Issue, ScanContext } from '../types/index.js'

interface OsvVulnerability {
  id: string
  summary: string
  severity?: Array<{ type: string; score: string }>
  affected: Array<{
    package: { name: string; ecosystem: string }
    ranges: Array<{ type: string; events: Array<{ introduced?: string; fixed?: string }> }>
    versions?: string[]
  }>
}

interface OsvResponse {
  vulns?: OsvVulnerability[]
}

interface PackageQuery {
  name: string
  version: string
  ecosystem: string
}

function detectEcosystem(ctx: ScanContext): PackageQuery[] {
  const files = ctx.files
  const packages: PackageQuery[] = []

  // Node.js — package.json
  if (ctx.packageJson) {
    const deps = {
      ...((ctx.packageJson.dependencies as Record<string, string>) ?? {}),
      ...((ctx.packageJson.devDependencies as Record<string, string>) ?? {}),
    }
    for (const [name, version] of Object.entries(deps)) {
      const clean = version
        .replaceAll('^', '').replaceAll('~', '')
        .replaceAll('>', '').replaceAll('=', '').replaceAll('<', '')
        .split(' ')[0]
      if (clean && clean !== '*') {
        packages.push({ name, version: clean, ecosystem: 'npm' })
      }
    }
  }

  // Python — requirements.txt
  const reqFile = Object.entries(files).find(([f]) =>
    f.endsWith('requirements.txt') || f.endsWith('requirements/base.txt')
  )
  if (reqFile) {
    const lines = reqFile[1].split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
      const match = trimmed.match(/^([a-zA-Z0-9_.-]+)([>=<!~^]+)([0-9a-zA-Z._-]+)?/)
      if (match) {
        const name = match[1].toLowerCase()
        const version = match[3] ?? '0.0.0'
        packages.push({ name, version, ecosystem: 'PyPI' })
      }
    }
  }

  // Python — pyproject.toml
  const pyproject = Object.entries(files).find(([f]) => f.endsWith('pyproject.toml'))
  if (pyproject) {
    const lines = pyproject[1].split('\n')
    let inDeps = false
    for (const line of lines) {
      if (line.includes('[tool.poetry.dependencies]') || line.includes('dependencies = [')) {
        inDeps = true; continue
      }
      if (inDeps && line.startsWith('[')) { inDeps = false; continue }
      if (inDeps) {
        const match = line.match(/["']?([a-zA-Z0-9_.-]+)["']?\s*[=>=<~^]+\s*["']?([0-9a-zA-Z._-]+)/)
        if (match && match[1] !== 'python') {
          packages.push({ name: match[1].toLowerCase(), version: match[2], ecosystem: 'PyPI' })
        }
      }
    }
  }

  // Go — go.mod
  const gomod = Object.entries(files).find(([f]) => f.endsWith('go.mod'))
  if (gomod) {
    const lines = gomod[1].split('\n')
    let inRequire = false
    for (const line of lines) {
      if (line.trim() === 'require (') { inRequire = true; continue }
      if (inRequire && line.trim() === ')') { inRequire = false; continue }
      if (inRequire || line.startsWith('require ')) {
        const match = line.trim().match(/^([a-zA-Z0-9._/-]+)\s+v([0-9a-zA-Z._-]+)/)
        if (match) {
          packages.push({ name: match[1], version: match[2], ecosystem: 'Go' })
        }
      }
    }
  }

  // Java — pom.xml
  const pomxml = Object.entries(files).find(([f]) => f.endsWith('pom.xml'))
  if (pomxml) {
    const content = pomxml[1]
    const depRegex = /<dependency>[\s\S]*?<groupId>(.*?)<\/groupId>[\s\S]*?<artifactId>(.*?)<\/artifactId>[\s\S]*?(?:<version>(.*?)<\/version>)?[\s\S]*?<\/dependency>/g
    let match
    while ((match = depRegex.exec(content)) !== null) {
      const name = `${match[1]}:${match[2]}`
      const version = match[3] ?? '0.0.0'
      if (!version.includes('$')) {
        packages.push({ name, version, ecosystem: 'Maven' })
      }
    }
  }

  // Rust — Cargo.toml
  const cargo = Object.entries(files).find(([f]) => f.endsWith('Cargo.toml'))
  if (cargo) {
    const lines = cargo[1].split('\n')
    let inDeps = false
    for (const line of lines) {
      if (line.trim() === '[dependencies]' || line.trim() === '[dev-dependencies]') {
        inDeps = true; continue
      }
      if (inDeps && line.startsWith('[')) { inDeps = false; continue }
      if (inDeps) {
        const match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']?([0-9a-zA-Z._^~*-]+)/)
        if (match) {
          const version = match[2]
            .replaceAll('^', '').replaceAll('~', '').replaceAll('*', '')
          packages.push({ name: match[1], version, ecosystem: 'crates.io' })
        }
      }
    }
  }

  return packages
}

function getSeverity(vuln: OsvVulnerability): 'critical' | 'warning' | 'advisory' {
  const severity = vuln.severity?.[0]
  if (!severity) return 'warning'
  const score = parseFloat(severity.score)
  if (score >= 9.0) return 'critical'
  if (score >= 7.0) return 'warning'
  if (score >= 4.0) return 'warning'
  return 'advisory'
}

function getFixedVersion(vuln: OsvVulnerability): string | undefined {
  for (const affected of vuln.affected) {
    for (const range of affected.ranges) {
      const fixed = range.events.find(e => e.fixed)
      if (fixed?.fixed) return fixed.fixed
    }
  }
  return undefined
}

export async function runOsvAudit(ctx: ScanContext): Promise<Issue[]> {
  const packages = detectEcosystem(ctx)
  if (packages.length === 0) return []

  const issues: Issue[] = []

  // osv.dev supports batch queries of up to 1000 packages
  // chunk into batches of 100 to be safe
  const chunkSize = 100
  for (let i = 0; i < packages.length; i += chunkSize) {
    const chunk = packages.slice(i, i + chunkSize)

    try {
      const response = await fetch('https://api.osv.dev/v1/querybatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: chunk.map(({ name, version, ecosystem }) => ({
            version,
            package: { name, ecosystem },
          })),
        }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      })

      if (!response.ok) continue

      const data = await response.json() as { results: Array<{ vulns?: OsvVulnerability[] }> }

      for (let j = 0; j < chunk.length; j++) {
        const pkg = chunk[j]
        const result = data.results[j]
        if (!result?.vulns?.length) continue

        for (const vuln of result.vulns) {
          const severity = getSeverity(vuln)
          const tier = severity === 'critical' ? 3 : severity === 'warning' ? 2 : 1
          const fixedVersion = getFixedVersion(vuln)
          const ecosystemLabel = pkg.ecosystem === 'npm' ? 'npm'
            : pkg.ecosystem === 'PyPI' ? 'pip'
            : pkg.ecosystem === 'Go' ? 'go get'
            : pkg.ecosystem === 'Maven' ? 'Maven'
            : pkg.ecosystem === 'crates.io' ? 'cargo'
            : 'package manager'

          issues.push({
            id: `osv:${pkg.ecosystem}:${pkg.name}:${vuln.id}`,
            severity,
            tier: tier as 1 | 2 | 3,
            title: `${pkg.name}@${pkg.version}: ${vuln.summary ?? vuln.id}`,
            detail: `${vuln.id} — ${pkg.ecosystem} package ${pkg.name}@${pkg.version} has a known vulnerability.`,
            fix: fixedVersion
              ? `Upgrade to ${pkg.name}@${fixedVersion} or later: ${ecosystemLabel} install ${pkg.name}@${fixedVersion}`
              : `Update ${pkg.name} to the latest version: ${ecosystemLabel} install ${pkg.name}`,
          })
        }
      }
    } catch {
      // fail silently — don't block audit if osv.dev is unreachable
      continue
    }
  }

  return issues
}

export function detectProjectLanguages(ctx: ScanContext): string[] {
  const languages: string[] = []
  const files = ctx.files

  if (ctx.packageJson) languages.push('Node.js')
  if (Object.keys(files).some(f => f.endsWith('requirements.txt') || f.endsWith('pyproject.toml'))) {
    languages.push('Python')
  }
  if (Object.keys(files).some(f => f.endsWith('go.mod'))) languages.push('Go')
  if (Object.keys(files).some(f => f.endsWith('pom.xml'))) languages.push('Java')
  if (Object.keys(files).some(f => f.endsWith('Cargo.toml'))) languages.push('Rust')

  return languages
}
