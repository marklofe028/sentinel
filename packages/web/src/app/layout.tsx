import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sentinel — Ship secure code',
  description: 'The senior engineer watching every line you ship.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 2rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'var(--bg)',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              fontSize: '16px',
              letterSpacing: '-0.02em',
            }}>
              SENTINEL
            </span>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--mono)',
            }}>
              v0.1.0
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Audit', href: '/audit' },
              { label: 'Vault', href: '/vault' },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}>
                {label}
              </a>
            ))}
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
