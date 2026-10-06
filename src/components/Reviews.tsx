import { m, useReducedMotion } from '../lib/motion'
import { REVIEWS, type Review } from '../data/reviews'
import { BgPhoto, Headline, spotMove } from './ui'

const ease = [0.22, 1, 0.36, 1] as const
const view = { once: true, margin: '0px 0px -10% 0px' }

/** Words rise out of a mask one after another. One observer on the whole line (a clipped word can never report as visible). */
function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <>{text}</>
  return (
    <m.span className="inline" initial="off" whileInView="on" viewport={view} transition={{ delayChildren: delay, staggerChildren: 0.025 }}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <m.span className="inline-block" variants={{ off: { y: "110%" }, on: { y: 0, transition: { duration: 0.3, ease } } }}>{w}&nbsp;</m.span>
        </span>
      ))}
    </m.span>
  )
}

function QuoteMark({ delay }: { delay: number }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 48 36" className="h-8 w-12 text-gold" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <m.path
        d="M20 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10c0 6-3 9-8 10M44 4H30a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10c0 6-3 9-8 10"
        initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={view} transition={{ duration: 0.9, delay, ease }}
      />
    </svg>
  )
}

function Card({ r, i }: { r: Review; i: number }) {
  const reduce = useReducedMotion()
  const tilt = [-2, 0, 2][i % 3]
  return (
    <m.figure
      className={i === 1 ? 'md:mt-8' : ''}
      initial={reduce ? false : { opacity: 0, y: 40, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={view} transition={{ duration: 0.55, delay: i * 0.12, ease }}
    >
      {/* hover lift lives on the inner element so it never fights the entrance transform */}
      <div onPointerMove={spotMove} className="spot relative h-full rounded-card border border-gold/40 bg-brand-hover p-8 transition duration-200 hover:-translate-y-1 hover:border-gold">
        {!r.verified && <span className="absolute right-6 top-6 rounded-full border border-gold px-2 text-micro font-bold uppercase tracking-wider text-gold">Sample</span>}
        <QuoteMark delay={0.2 + i * 0.12} />
        <blockquote className="mt-6 font-display text-title font-semibold text-page">
          <Words text={r.quote} delay={0.25 + i * 0.12} />
        </blockquote>
        <figcaption className="mt-8">
          <m.span
            aria-hidden="true" className="mb-4 block h-px w-12 origin-left bg-gold"
            initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={view} transition={{ duration: 0.5, delay: 0.7 + i * 0.12, ease }}
          />
          <span className="block font-bold text-page">{r.name}</span>
          <span className="block text-small text-page/70">{r.source} · {r.date}</span>
        </figcaption>
      </div>
    </m.figure>
  )
}

export default function Reviews() {
  const anySample = REVIEWS.some(r => !r.verified)
  return (
    <section className="on-dark grain section relative isolate">
      <BgPhoto k="table" side="full" />
      <div className="wrap">
        <div className="mb-12 max-w-xl">
          <p className="eyebrow mb-4">Guest reviews</p>
          <Headline as="h2">What our guests say</Headline>
          {anySample && <p className="mt-4 text-small text-page/70">Sample text shown for layout. Verified reviews (platform, name and date) replace these before launch.</p>}
        </div>
        <div className="grid items-start gap-6 md:grid-cols-3">
          {REVIEWS.slice(0, 3).map((r, i) => <Card key={i} r={r} i={i} />)}
        </div>
      </div>
    </section>
  )
}
