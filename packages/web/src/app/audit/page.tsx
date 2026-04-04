'use client'
import { useState } from 'react'
import { ScoreGauge } from '../../components/ScoreGauge'
import { IssueCard } from '../../components/IssueCard'
import { StatusBanner } from '../../components/StatusBanner'
import type { AuditResult, Issue } from '@sentinel-dev/core'

const DEMO_FILES = {
  'src/config.ts': `const apiKey = "sk_live_" + "demo1234567890abcdef"\nconst debug = true\nDEBUG=true`,
  'src/server.ts': `import express from 'express'\nconst app = express()\napp.use(cors({ origin: "*" }))\napp.post("/auth/login", handler)`,
  'package.json': JSON.stringify({
    dependencies: { lodash: '4.17.20', axios: '^1.5.0', express: '^4.18.0' }
  }, null, 2),
}

export default function AuditPage() {
  const [result, setResult] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'demo' | 'paste'>('demo')
  const [pastedCode, setPasted] = useState('')

  async function runAudit(files: Record<string, string>) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      })
      if (!res.ok) throw new Error('Audit request failed')
      setResult(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const tier3 = result?.issues.filter((i: Issue) => i.tier === 3) ?? []
  const tier2 = result?.issues.filter((i: Issue) => i.tier === 2) ?? []
  const tier1 = result?.issues.filter((i: Issue) => i.tier === 1) ?? []

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 2rem' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: '8px'
        }}>
          Audit
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Run Sentinel against a codebase. In production, connect via CLI or API.
        </p>
      </div>

      {/* mode selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['demo', 'paste'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '7px 16px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: mode === m ? 'var(--text-primary)' : 'var(--border)',
            background: mode === m ? 'var(--text-primary)' : 'transparent',
            color: mode === m ? 'var(--bg)' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: mode === m ? 600 : 400,
            cursor: 'pointer',
          }}>
            {m === 'demo' ? 'Demo project' : 'Paste code'}
          </button>
        ))}
      </div>

      {mode === 'paste' && (
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={pastedCode}
            onChange={e => setPasted(e.target.value)}
            placeholder="Paste your code here..."
            rows={8}
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--mono)',
              fontSize: '13px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
      )}

      <button
        onClick={() => runAudit(mode === 'demo' ? DEMO_FILES : { 'input.ts': pastedCode })}
        disabled={loading || (mode === 'paste' && !pastedCode.trim())}
        style={{
          padding: '11px 28px',
          background: loading ? 'var(--bg-hover)' : 'var(--text-primary)',
          color: loading ? 'var(--text-muted)' : 'var(--bg)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '40px',
          fontFamily: 'var(--mono)',
        }}
      >
        {loading ? 'Scanning...' : '▶ Run sentinel audit'}
      </button>

      {error && (
        <div style={{
          color: '#ef4444', fontSize: '13px',
          marginBottom: '24px', fontFamily: 'var(--mono)'
        }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div>
          {/* score row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            marginBottom: '16px',
          }}>
            <ScoreGauge score={result.score} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                letterSpacing: '0.08em',
              }}>
                AUDIT RESULT
              </div>
              <StatusBanner score={result.score} />
              <div style={{
                display: 'flex',
                gap: '24px',
                marginTop: '16px',
              }}>
                {[
                  { label: 'Issues', value: result.issues.length },
                  { label: 'Blocks', value: tier3.length, color: '#ef4444' },
                  { label: 'Warns', value: tier2.length, color: '#eab308' },
                  { label: 'Advisory', value: tier1.length, color: '#666' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: color ?? 'var(--text-primary)',
                    }}>
                      {value}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* issues */}
          {result.issues.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#22c55e',
              fontFamily: 'var(--mono)',
              fontSize: '14px',
            }}>
              ✓ No issues found. Suit is clean.
            </div>
          ) : (
            <div>
              {[
                { list: tier3, heading: `Hard blocks (${tier3.length})`, color: '#ef4444' },
                { list: tier2, heading: `Friction gates (${tier2.length})`, color: '#eab308' },
                { list: tier1, heading: `Advisories (${tier1.length})`, color: '#666' },
              ].filter(g => g.list.length > 0).map(({ list, heading, color }) => (
                <div key={heading} style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color,
                    letterSpacing: '0.08em',
                    marginBottom: '10px',
                  }}>
                    {heading.toUpperCase()}
                  </div>
                  {list.map((issue: Issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
