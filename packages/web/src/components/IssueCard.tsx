'use client'
import { useState } from 'react'
import type { Issue } from '@sentinel-dev/core'

interface Props { issue: Issue }

const TIER_CONFIG = {
  3: { label: 'BLOCK',    color: '#ef4444', bg: '#1a0a0a' },
  2: { label: 'WARN',     color: '#eab308', bg: '#1a1500' },
  1: { label: 'ADVISORY', color: '#888888', bg: '#111111' },
} as const

export function IssueCard({ issue }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const config = TIER_CONFIG[issue.tier as keyof typeof TIER_CONFIG]

  function copyFix() {
    if (!issue.fix) return
    navigator.clipboard.writeText(issue.fix)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: expanded ? config.bg : 'var(--bg-card)',
        border: `1px solid ${expanded ? config.color + '44' : 'var(--border)'}`,
        borderLeft: `3px solid ${config.color}`,
        borderRadius: '8px',
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          fontWeight: 700,
          color: config.color,
          minWidth: '64px',
        }}>
          [{config.label}]
        </span>
        <span style={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>
          {issue.title}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px',
          borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)',
            lineHeight: 1.6, marginBottom: '8px' }}>
            {issue.detail}
          </p>
          {issue.file && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px',
              color: 'var(--text-muted)', marginBottom: '10px' }}>
              {issue.file}{issue.line ? `:${issue.line}` : ''}
            </p>
          )}
          {issue.fix && (
            <div style={{ display: 'flex', alignItems: 'flex-start',
              gap: '10px', marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: '#22c55e',
                lineHeight: 1.5, flex: 1 }}>
                Fix: {issue.fix}
              </p>
              <button
                onClick={e => { e.stopPropagation(); copyFix() }}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-accent)',
                  background: 'transparent',
                  color: copied ? '#22c55e' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {copied ? 'copied ✓' : 'copy fix'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
