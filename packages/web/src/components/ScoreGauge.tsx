'use client'

interface Props { score: number; size?: number }

export function ScoreGauge({ score, size = 160 }: Props) {
  const r = 54
  const cx = 60
  const cy = 60
  const circumference = 2 * Math.PI * r
  const progress = (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r}
          fill="none" stroke="#222" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle"
          fill={color}
          fontSize="22" fontWeight="700"
          fontFamily="var(--mono)">
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle"
          fill="#666" fontSize="10"
          fontFamily="var(--mono)">
          / 100
        </text>
      </svg>
    </div>
  )
}
