import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Diamond, usePauseOffscreen } from './ui'

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

/**
 * Three glossy hanging baubles, each swinging from its own string-attachment point like a pendulum
 * (not spinning in place) -- a hand-built "3D ornament" visual in the brand's own red/gold/green,
 * instead of a stock photo or an external animated asset. Pure SVG + CSS, no image downloads.
 */
export function Ornaments({ className = '' }: { className?: string }) {
  const ref = usePauseOffscreen<HTMLDivElement>()
  return (
    <div ref={ref} className={`relative mx-auto aspect-square w-full max-w-sm ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 38%, rgb(var(--xgold) / 0.25), transparent 65%)' }} />
      <svg viewBox="0 0 240 260" className="relative h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="ballRed" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#E98A90" /><stop offset="55%" stopColor="#B13540" /><stop offset="100%" stopColor="#5C141C" />
          </radialGradient>
          <radialGradient id="ballGold" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#FBEFD2" /><stop offset="55%" stopColor="#D6AF5C" /><stop offset="100%" stopColor="#8C6A2E" />
          </radialGradient>
          <radialGradient id="ballGreen" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#6FBB9B" /><stop offset="55%" stopColor="#1E5A43" /><stop offset="100%" stopColor="#06180F" />
          </radialGradient>
        </defs>

        <path d="M26 20 Q120 -6 214 20" fill="none" stroke="#D6AF5C" strokeOpacity="0.6" strokeWidth="2" />

        {/* Small red bauble, left */}
        <g className="bauble" style={{ '--origin-x': '54px', '--origin-y': '18px', '--swing-dur': '3s', '--swing-delay': '-0.6s' } as CSSProperties}>
          <line x1="54" y1="18" x2="54" y2="50" stroke="#D6AF5C" strokeWidth="2" />
          <ellipse cx="54" cy="52" rx="7" ry="5" fill="#D6AF5C" />
          <circle cx="54" cy="80" r="26" fill="url(#ballRed)" />
          <ellipse cx="45" cy="68" rx="7" ry="11" fill="#fff" opacity="0.3" />
        </g>

        {/* Large gold bauble, centre -- the focal point */}
        <g className="bauble" style={{ '--origin-x': '124px', '--origin-y': '12px', '--swing-dur': '3.8s', '--swing-delay': '-1.4s' } as CSSProperties}>
          <line x1="124" y1="12" x2="124" y2="52" stroke="#D6AF5C" strokeWidth="2" />
          <ellipse cx="124" cy="54" rx="9" ry="6" fill="#D6AF5C" />
          <circle cx="124" cy="120" r="44" fill="url(#ballGold)" />
          <ellipse cx="109" cy="100" rx="11" ry="17" fill="#fff" opacity="0.35" />
        </g>

        {/* Medium green bauble, right */}
        <g className="bauble" style={{ '--origin-x': '192px', '--origin-y': '20px', '--swing-dur': '3.3s', '--swing-delay': '-2s' } as CSSProperties}>
          <line x1="192" y1="20" x2="192" y2="52" stroke="#D6AF5C" strokeWidth="2" />
          <ellipse cx="192" cy="54" rx="7" ry="5" fill="#D6AF5C" />
          <circle cx="192" cy="86" r="30" fill="url(#ballGreen)" />
          <ellipse cx="182" cy="73" rx="8" ry="12" fill="#fff" opacity="0.3" />
        </g>
      </svg>
      <div className="pointer-events-none absolute -inset-2" aria-hidden="true">
        {[['10%', '8%', '0s'], ['88%', '30%', '0.6s'], ['6%', '62%', '1.1s'], ['92%', '78%', '1.6s']].map(([x, y, delay]) => (
          <span key={x + y} className="absolute" style={{ left: x, top: y, animation: `twinkle 2.2s ease-in-out ${delay} infinite` }}>
            <Diamond className="h-3 w-3 text-gold" />
          </span>
        ))}
      </div>
    </div>
  )
}

const TREE_LIGHTS = [
  { x: 24, y: 182, c: 'Red' }, { x: 52, y: 184, c: 'Gold' }, { x: 100, y: 183, c: 'Ice' }, { x: 132, y: 180, c: 'Red' },
  { x: 38, y: 150, c: 'Gold' }, { x: 72, y: 154, c: 'Red' }, { x: 108, y: 148, c: 'Ice' },
  { x: 50, y: 122, c: 'Ice' }, { x: 92, y: 125, c: 'Gold' },
  { x: 58, y: 97, c: 'Red' }, { x: 96, y: 95, c: 'Gold' },
  { x: 65, y: 73, c: 'Ice' }, { x: 90, y: 71, c: 'Red' },
  { x: 80, y: 48, c: 'Gold' },
] as const

/**
 * A hand-built 3D Christmas tree -- gradient-shaded tiers for volume, a gold star, and a garland of
 * glossy glowing string lights (same radial-gradient "glossy sphere" technique as the Ornaments
 * baubles) that twinkle out of phase. Pure SVG + CSS, no stock photo or external asset.
 */
export function ChristmasTree({ className = '' }: { className?: string }) {
  const ref = usePauseOffscreen<HTMLDivElement>()
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 160 220" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="treeTier" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2F6B4F" /><stop offset="55%" stopColor="#1C4A36" /><stop offset="100%" stopColor="#0A2A1E" />
          </linearGradient>
          <radialGradient id="lightRed" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#FFC9CC" /><stop offset="60%" stopColor="#D1434F" /><stop offset="100%" stopColor="#7A1C24" /></radialGradient>
          <radialGradient id="lightGold" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#FFF4D6" /><stop offset="60%" stopColor="#E8C06B" /><stop offset="100%" stopColor="#9C7A35" /></radialGradient>
          <radialGradient id="lightIce" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#BFE3F2" /><stop offset="100%" stopColor="#5D97AE" /></radialGradient>
        </defs>

        <rect x="70" y="188" width="20" height="26" rx="2" fill="#43290E" />
        <polygon points="10,190 150,190 80,130" fill="url(#treeTier)" />
        <polygon points="25,150 135,150 80,92" fill="url(#treeTier)" />
        <polygon points="42,108 118,108 80,52" fill="url(#treeTier)" />

        <circle cx="80" cy="34" r="15" fill="rgb(var(--xgold))" opacity="0.25" style={{ animation: 'twinkle 2.6s ease-in-out infinite' }} />
        <path d="M80 20 84 30 95 30 86 37 89 48 80 41 71 48 74 37 65 30 76 30Z" fill="rgb(var(--xgold))" />

        {TREE_LIGHTS.map((l, i) => (
          <g key={i} style={{ animation: `twinkle ${1.8 + (i % 4) * 0.15}s ease-in-out ${(i % 7) * 0.3}s infinite` }}>
            <circle cx={l.x} cy={l.y} r="7" fill={`url(#light${l.c})`} opacity="0.3" />
            <circle cx={l.x} cy={l.y} r="3.2" fill={`url(#light${l.c})`} />
          </g>
        ))}
      </svg>
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
