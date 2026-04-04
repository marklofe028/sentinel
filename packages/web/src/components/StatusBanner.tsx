interface Props { score: number; threshold?: number }

export function StatusBanner({ score, threshold = 70 }: Props) {
  const ok = score >= threshold
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 16px',
      borderRadius: '6px',
      border: `1px solid ${ok ? '#22c55e44' : '#ef444444'}`,
      background: ok ? '#0a1a0a' : '#1a0a0a',
    }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '12px',
        fontWeight: 700,
        color: ok ? '#22c55e' : '#ef4444',
      }}>
        {ok ? '[SENTINEL:OK]' : '[SENTINEL:BLOCK]'}
      </span>
      <span style={{ fontSize: '13px', color: ok ? '#86efac' : '#fca5a5' }}>
        {ok ? 'Clear to deploy' : `Below threshold — review issues before deploying`}
      </span>
    </div>
  )
}
