import { useMemo } from 'react'
import type { CSSProperties } from 'react'

/** Soft falling snow, pure CSS transform/opacity, paused off-screen and for reduced motion. Decorative only. */
export function Snowfall({ count = 26 }: { count?: number }) {
  const flakes = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.round(Math.random() * 100)}%`,
    size: `${8 + Math.round(Math.random() * 11)}px`,
    o: (0.3 + Math.random() * 0.5).toFixed(2),
    dur: `${9 + Math.random() * 10}s`,
    delay: `${(-Math.random() * 16).toFixed(1)}s`,
    drift: `${Math.round((Math.random() - 0.5) * 70)}px`,
    glyph: Math.random() > 0.45 ? '❄' : '•',
  })), [count])
  return (
    <div className="snowfall" aria-hidden="true">
      {flakes.map(f => (
        <span
          key={f.id}
          className="snowflake"
          style={{ '--x': f.x, '--size': f.size, '--o': f.o, '--dur': f.dur, '--delay': f.delay, '--drift': f.drift } as CSSProperties}
        >
          {f.glyph}
        </span>
      ))}
    </div>
  )
}

/** Three gold bulbs that twinkle out of phase, under an eyebrow line. Decorative only. */
export function FairyLights() {
  return (
    <div className="fairylights" aria-hidden="true">
      {[0, 0.4, 0.8].map(d => <span key={d} style={{ background: 'rgb(var(--xgold))', animationDelay: `${d}s` }} />)}
    </div>
  )
}

export const CHRISTMAS_TIMES = [
  { value: '12:30', label: '12.30pm' },
  { value: '15:30', label: '3.30pm' },
] as const

export const CHRISTMAS_TABLES = [
  { id: 'christmas', label: 'Christmas Table', sub: 'Our festive set menu' },
  { id: 'indian', label: 'Indian Table', sub: 'Full à la carte Indian menu' },
  { id: 'little', label: 'Little Table', sub: "Children's menu" },
] as const
