export default function VaultPage() {
  const templates = [
    { domain: 'saas',      label: 'SaaS',          desc: 'Auth, billing, multi-tenancy, env management' },
    { domain: 'api',       label: 'REST API',       desc: 'Rate limiting, auth middleware, OpenAPI spec' },
    { domain: 'mobile',    label: 'Mobile backend', desc: 'Push notifications, device auth, offline sync' },
    { domain: 'ecommerce', label: 'E-commerce',     desc: 'Payment hooks, inventory, order management' },
    { domain: 'internal',  label: 'Internal tool',  desc: 'SSO, audit logs, role-based access control' },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 2rem' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Vault
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Domain-specific bootstrap templates. Start right, stay right.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1px', background: 'var(--border)',
        borderRadius: '8px', overflow: 'hidden' }}>
        {templates.map(({ domain, label, desc }) => (
          <div key={domain} style={{
            background: 'var(--bg-card)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {desc}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              padding: '6px 14px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}>
              assay init {domain}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '32px',
        padding: '16px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontFamily: 'var(--mono)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}>
        {'Templates coming in v0.2.0 — run '}
        <span style={{ color: 'var(--text-primary)' }}>assay init saas</span>
        {' from the CLI to scaffold today.'}
      </div>
    </div>
  )
}
