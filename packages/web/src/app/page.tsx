import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 2rem' }}>

      {/* HERO */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginBottom: '20px',
          textTransform: 'uppercase',
        }}>
          ASSAY / v0.1.0 — pre-deployment code auditor
        </p>

        <h1 style={{
          fontSize: '40px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '20px',
        }}>
          Move fast with AI.
          <br />
          <span style={{ color: 'var(--text-secondary)' }}>
            Without shipping vulnerabilities.
          </span>
        </h1>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          maxWidth: '540px',
          marginBottom: '12px',
        }}>
          Assay audits your codebase before it hits production — catching hardcoded secrets,
          known CVEs, missing environment hygiene, and deployment anti-patterns.
          In seconds.
        </p>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '540px',
        }}>
          Built for AI-assisted developers, indie builders, and fast-moving teams
          who don't have a senior engineer reviewing every line.
        </p>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '64px', flexWrap: 'wrap' }}>
        <Link href="/audit" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'var(--text-primary)',
          color: 'var(--bg)',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          Run audit free
        </Link>
        <a href="https://github.com/marklofe028/assay" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block',
          padding: '12px 24px',
          border: '1px solid var(--border-accent)',
          color: 'var(--text-secondary)',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
        }}>
          View on GitHub
        </a>
      </div>

      {/* DIFFERENTIATION LINE */}
      <div style={{
        borderLeft: '2px solid var(--border-accent)',
        paddingLeft: '16px',
        marginBottom: '64px',
      }}>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          Most tools tell you what's wrong.
          Assay tells you <span style={{ color: 'var(--text-primary)', fontStyle: 'normal', fontWeight: 500 }}>what to do about it</span> —
          in plain language, before you deploy, with the specificity of a senior engineer
          who's seen this before.
        </p>
      </div>

      {/* LIVE CLI OUTPUT */}
      <div style={{ marginBottom: '64px' }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          marginBottom: '12px',
          textTransform: 'uppercase',
        }}>
          What it looks like
        </p>
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '20px 24px',
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          lineHeight: 1.8,
        }}>
          <p style={{ color: '#666', marginBottom: '8px' }}>$ assay audit ./my-startup</p>

          <p style={{ color: '#e8e8e8', fontWeight: 700, marginBottom: '4px' }}>ASSAY AUDIT REPORT</p>
          <p style={{ color: '#444', marginBottom: '12px' }}>────────────────────────────────</p>

          <p style={{ color: '#e8e8e8', marginBottom: '2px' }}>Score:&nbsp;&nbsp;&nbsp;
            <span style={{ color: '#ef4444', fontWeight: 700 }}>42 / 100</span>
          </p>
          <p style={{ color: '#e8e8e8', marginBottom: '2px' }}>Files:&nbsp;&nbsp;&nbsp;38</p>
          <p style={{ color: '#e8e8e8', marginBottom: '2px' }}>Issues:&nbsp;&nbsp;7</p>
          <p style={{ color: '#e8e8e8', marginBottom: '12px' }}>Status:&nbsp;&nbsp;
            <span style={{ color: '#ef4444' }}>[ASSAY:BLOCK] Below threshold — review issues first</span>
          </p>

          <p style={{ color: '#444', marginBottom: '12px' }}>────────────────────────────────</p>

          <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '6px' }}>[BLOCK] Hard blocks (1)</p>
          <p style={{ color: '#ef4444', marginBottom: '2px' }}>&nbsp;&nbsp;✕ Stripe live key detected in source file</p>
          <p style={{ color: '#666', marginBottom: '2px' }}>&nbsp;&nbsp;&nbsp;&nbsp;src/config.ts contains what looks like a Stripe live key: "sk_live_ab..."</p>
          <p style={{ color: '#4ade80', marginBottom: '12px' }}>&nbsp;&nbsp;&nbsp;&nbsp;Fix: Move to .env and add .env to .gitignore. Rotate the key immediately.</p>

          <p style={{ color: '#eab308', fontWeight: 700, marginBottom: '6px' }}>[WARN] Friction gates (3)</p>
          <p style={{ color: '#eab308', marginBottom: '2px' }}>&nbsp;&nbsp;⚠ lodash@4.17.20 has a known CVE</p>
          <p style={{ color: '#666', marginBottom: '2px' }}>&nbsp;&nbsp;&nbsp;&nbsp;CVE-2021-23337 — affects versions below 4.17.21</p>
          <p style={{ color: '#4ade80', marginBottom: '8px' }}>&nbsp;&nbsp;&nbsp;&nbsp;Fix: Upgrade: pnpm add lodash@latest</p>

          <p style={{ color: '#eab308', marginBottom: '2px' }}>&nbsp;&nbsp;⚠ CORS wildcard origin detected</p>
          <p style={{ color: '#666', marginBottom: '2px' }}>&nbsp;&nbsp;&nbsp;&nbsp;src/server.ts allows requests from any origin (*)</p>
          <p style={{ color: '#4ade80', marginBottom: '8px' }}>&nbsp;&nbsp;&nbsp;&nbsp;Fix: Restrict to your frontend domain via process.env.ALLOWED_ORIGIN</p>

          <p style={{ color: '#eab308', marginBottom: '2px' }}>&nbsp;&nbsp;⚠ Auth route has no rate limiting</p>
          <p style={{ color: '#666', marginBottom: '2px' }}>&nbsp;&nbsp;&nbsp;&nbsp;src/routes/auth.ts defines /auth without brute-force protection</p>
          <p style={{ color: '#4ade80', marginBottom: '12px' }}>&nbsp;&nbsp;&nbsp;&nbsp;Fix: Add express-rate-limit to /auth endpoints</p>

          <p style={{ color: '#888', fontWeight: 700, marginBottom: '6px' }}>[ADVISORY] Advisories (3)</p>
          <p style={{ color: '#888', marginBottom: '2px' }}>&nbsp;&nbsp;· Unpinned dependency: axios (^1.5.0)</p>
          <p style={{ color: '#888', marginBottom: '2px' }}>&nbsp;&nbsp;· No .env.example file found</p>
          <p style={{ color: '#888', marginBottom: '2px' }}>&nbsp;&nbsp;· Security headers not set (missing helmet)</p>
        </div>
      </div>

      {/* WHAT IT CATCHES */}
      <div style={{ marginBottom: '64px' }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          What it catches
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {[
            { label: 'Secrets detection', tier: 'BLOCK', desc: 'API keys, tokens, credentials in source' },
            { label: 'CVE scanning',      tier: 'WARN',  desc: 'Live npm audit — real-time vulnerabilities' },
            { label: 'Env hygiene',       tier: 'WARN',  desc: 'DEBUG flags, .env not in .gitignore' },
            { label: 'CORS policy',       tier: 'WARN',  desc: 'Wildcard origins dangerous in production' },
            { label: 'Rate limiting',     tier: 'WARN',  desc: 'Auth routes without brute-force protection' },
            { label: 'Security headers',  tier: 'ADVISORY', desc: 'Helmet, XSS, CSRF, clickjacking' },
          ].map(({ label, tier, desc }) => {
            const color = tier === 'BLOCK' ? '#ef4444' : tier === 'WARN' ? '#eab308' : '#666'
            return (
              <div key={label} style={{ background: 'var(--bg-card)', padding: '20px' }}>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color,
                  marginBottom: '6px',
                  fontWeight: 700,
                }}>
                  [{tier}]
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* NOT vs IS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '64px',
      }}>
        <div style={{ background: 'var(--bg-card)', padding: '24px' }}>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: '#ef4444',
            marginBottom: '12px',
            fontWeight: 700,
          }}>
            NOT this
          </p>
          {[
            'A linter — Assay doesn\'t care about style',
            'A test runner — Assay audits, not tests',
            'An enterprise SIEM — no dashboards, no agents',
            'A replacement for security engineers',
          ].map(item => (
            <p key={item} style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              lineHeight: 1.5,
            }}>
              ✕ {item}
            </p>
          ))}
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '24px' }}>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: '#22c55e',
            marginBottom: '12px',
            fontWeight: 700,
          }}>
            THIS
          </p>
          {[
            'Pre-deployment audit — runs before you ship',
            'Plain language output — explains why it matters',
            'Actionable fixes — one sentence, do this',
            'Built for the vibe coding era',
          ].map(item => (
            <p key={item} style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              lineHeight: 1.5,
            }}>
              ✓ {item}
            </p>
          ))}
        </div>
      </div>

      {/* INSTALL */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px 24px',
        marginBottom: '64px',
      }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Get started in 30 seconds
        </p>
        {[
          'npm install -g @assay-dev/cli',
          'cd your-project',
          'assay audit .',
        ].map((cmd, i) => (
          <p key={cmd} style={{
            fontFamily: 'var(--mono)',
            fontSize: '14px',
            color: i === 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
            lineHeight: 2,
            fontWeight: i === 2 ? 500 : 400,
          }}>
            <span style={{ color: 'var(--text-muted)' }}>$ </span>{cmd}
          </p>
        ))}
      </div>

      {/* BOTTOM CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link href="/audit" style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: 'var(--text-primary)',
          color: 'var(--bg)',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '15px',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          Run a free audit now
        </Link>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          No account required. No data stored. Runs in your browser.
        </p>
      </div>

    </div>
  )
}
