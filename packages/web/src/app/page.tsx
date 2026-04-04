import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '80px 2rem',
    }}>
      <div style={{ marginBottom: '60px' }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}>
          SENTINEL / v0.1.0
        </p>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '16px',
        }}>
          The senior engineer<br />
          <span style={{ color: 'var(--text-secondary)' }}>
            watching every line you ship.
          </span>
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          maxWidth: '520px',
        }}>
          Sentinel audits AI-generated and vibe-coded projects before they hit
          production. Security, environment hygiene, dependency CVEs, and
          deployment readiness — in seconds.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '80px' }}>
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
          Run audit
        </Link>
        <a href="https://github.com" style={{
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px',
        background: 'var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '60px',
      }}>
        {[
          { label: 'Secrets detection', tier: 'BLOCK',    desc: 'API keys, tokens, credentials in source' },
          { label: 'CVE scanning',      tier: 'WARN',     desc: 'Known vulnerabilities in dependencies' },
          { label: 'Env hygiene',       tier: 'WARN',     desc: 'DEBUG flags, missing .gitignore, no .env.example' },
          { label: 'CORS policy',       tier: 'WARN',     desc: 'Wildcard origins dangerous in production' },
          { label: 'Rate limiting',     tier: 'WARN',     desc: 'Auth routes without brute-force protection' },
          { label: 'Security headers',  tier: 'ADVISORY', desc: 'Helmet, XSS, CSRF, clickjacking' },
        ].map(({ label, tier, desc }) => {
          const color = tier === 'BLOCK' ? '#ef4444' : tier === 'WARN' ? '#eab308' : '#666'
          return (
            <div key={label} style={{
              background: 'var(--bg-card)',
              padding: '20px',
            }}>
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

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px 24px',
      }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
        }}>
          # install and run
        </p>
        {[
          'npm install -g @sentinel-dev/cli',
          'sentinel audit .',
        ].map(cmd => (
          <p key={cmd} style={{
            fontFamily: 'var(--mono)',
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: 2,
          }}>
            <span style={{ color: 'var(--text-muted)' }}>$ </span>{cmd}
          </p>
        ))}
      </div>
    </div>
  )
}
