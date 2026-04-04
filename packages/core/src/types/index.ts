export type Severity = 'advisory' | 'warning' | 'critical'
export type PushbackTier = 1 | 2 | 3
export type Domain = 'saas' | 'api' | 'mobile' | 'ecommerce' | 'internal'
export type Environment = 'development' | 'staging' | 'production'

export interface Issue {
  id: string
  severity: Severity
  tier: PushbackTier
  title: string
  detail: string
  fix?: string
  file?: string
  line?: number
}

export interface AuditResult {
  score: number
  issues: Issue[]
  passedChecks: number
  timestamp: Date
  env: Environment
}

export interface Rule {
  id: string
  name: string
  tier: PushbackTier
  check: (ctx: ScanContext) => Issue[]
}

export interface ScanContext {
  files: Record<string, string>
  env: Record<string, string>
  packageJson?: Record<string, unknown>
  gitignore?: string[]
}

export interface ProjectContext {
  projectName: string
  domain: Domain
  env: Environment
  auditScore?: number
  scoreThreshold: number
  flaggedIssues: Issue[]
  lastCommitSummary?: string
  openFiles?: string[]
  sessionAcknowledged: string[]
}
