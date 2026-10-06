import { useEffect, useRef, useState } from 'react'
import { m, useInView, useReducedMotion } from '../lib/motion'
import { REVIEWS, type Review } from '../data/reviews'
import { BgPhoto, Headline, spotMove } from './ui'

const ease = [0.22, 1, 0.36, 1] as const
const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z'

function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const q = window.matchMedia('(max-width: 767px)')
    const f = () => setMob(q.matches)
    q.addEventListener('change', f)
    return () => q.removeEventListener('change', f)
  }, [])
  return mob
}

/** Types the text out character by character while `run` is true; resets when it turns false. */
function useTyped(text: string, run: boolean, delay: number, reduce: boolean, speed = 22) {
  const [n, setN] = useState(reduce ? text.length : 0)
  useEffect(() => {
    if (reduce) return
    if (!run) { setN(0); return }
    let i = 0
    let id = 0
    const t = window.setTimeout(() => {
      id = window.setInterval(() => { i += 1; setN(i); if (i >= text.length) window.clearInterval(id) }, speed)
    }, delay)
    return () => { window.clearTimeout(t); window.clearInterval(id) }
  }, [run, text, delay, reduce, speed])
  return n
}

/** Lights the stars one after another while `run` is true; resets when it turns false. */
function useLit(target: number, run: boolean, reduce: boolean) {
  const [lit, setLit] = useState(reduce ? target : 0)
  useEffect(() => {
    if (reduce) return
    if (!run) { setLit(0); return }
    const id = window.setInterval(() => setLit(l => { if (l >= target) { window.clearInterval(id); return l } return l + 1 }), 170)
    return () => window.clearInterval(id)
  }, [run, target, reduce])
  return lit
}

function Stars({ lit }: { lit: number }) {
  return (
    <span className="flex items-center gap-2" role="img" aria-label={`Rated ${lit} out of 5 so far`}>
      {[0, 1, 2, 3, 4].map(i => {
        const on = i < lit
        return (
          <m.svg key={i} viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"
            animate={on ? { scale: [0.6, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.35, ease }}>
            <path d={STAR} strokeWidth="1.5" strokeLinejoin="round" className={`transition-colors duration-200 ${on ? 'fill-gold stroke-gold' : 'fill-transparent stroke-ink/30'}`} />
          </m.svg>
        )
      })}
    </span>
  )
}

function Card({ r, i, mobile, active }: { r: Review; i: number; mobile: boolean; active: boolean }) {
  const reduce = !!useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const run = mobile ? active : seen // desktop: type once when scrolled into view. Mobile: type whenever this slide is the active one
  const n = useTyped(r.quote, run, mobile ? 500 : 400 + i * 600, reduce)
  const typing = run && n < r.quote.length
  const lit = useLit(r.rating, n >= r.quote.length && n > 0, reduce)

  return (
    <m.figure
      ref={ref} data-i={i}
      className={`flex w-[calc(100%-2rem)] shrink-0 snap-center flex-col md:w-auto md:shrink ${i === 1 ? 'md:mt-8' : ''}`}
      initial={reduce || mobile ? false : { opacity: 0, y: 32 }} animate={!mobile && seen ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5, delay: i * 0.12, ease }}
    >
      <div onPointerMove={spotMove} className="spot relative flex flex-1 flex-col rounded-card border border-gold/40 bg-page p-8 text-ink transition duration-200 hover:-translate-y-1 hover:border-gold">
        {!r.verified && <span className="absolute right-6 top-6 rounded-full border border-gold-text px-2 text-micro font-bold uppercase tracking-wider text-gold-text">Sample</span>}

        <figcaption className="flex items-center gap-4 pr-24">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-page" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-4 4-5.5 7-5.5s5.8 1.5 7 5.5" /></svg>
          </span>
          <span>
            <span className="block font-bold text-brand">{r.name}</span>
            <span className="block text-small text-ink/70">{r.source} · {r.date}</span>
          </span>
        </figcaption>

        <div className="mt-6 flex items-center justify-between gap-4">
          <Stars lit={lit} />
          <span className="font-bold tabular-nums text-brand" aria-hidden="true">{lit.toFixed(1)}</span>
        </div>

        {/* Screen readers get the whole review at once; the visible copy types out over an invisible spacer so nothing jumps. */}
        <blockquote className="relative mt-6 flex-1">
          <p className="sr-only">{r.quote}</p>
          <p aria-hidden="true" className="invisible">{r.quote}</p>
          <p aria-hidden="true" className="absolute inset-0">
            {r.quote.slice(0, n)}
            {(typing || (!run && !seen && !reduce && !mobile)) && <span className="caret ml-px inline-block h-6 w-px bg-gold-text align-bottom" />}
          </p>
        </blockquote>
      </div>
    </m.figure>
  )
}

export default function Reviews() {
  const reviews = REVIEWS.slice(0, 3)
  const anySample = reviews.some(r => !r.verified)
  const mobile = useIsMobile()
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const visible = useInView(section, { margin: '-20% 0px -20% 0px' })
  const [index, setIndex] = useState(0)
  const reduce = !!useReducedMotion()

  const go = (i: number) => {
    const root = track.current
    const card = root?.querySelector<HTMLElement>(`[data-i="${i}"]`)
    if (root && card) root.scrollTo({ left: card.offsetLeft - (root.clientWidth - card.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
  }

  // Which slide is centred? (phone slider; the visitor swipes, nothing moves on its own)
  useEffect(() => {
    const root = track.current
    if (!root || !mobile) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i)) }), { root, threshold: 0.6 })
    root.querySelectorAll('[data-i]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [mobile])

  return (
    <section ref={section} className="on-dark grain section relative isolate">
      <BgPhoto k="table" side="full" />
      <div className="wrap">
        <div className="mb-12 max-w-xl">
          <p className="eyebrow mb-4">Guest reviews</p>
          <Headline as="h2">What our guests say</Headline>
          {anySample && <p className="mt-4 text-small text-page/70">Sample text and ratings shown for layout. Verified reviews (platform, name and date) replace these before launch.</p>}
        </div>

        <div
          ref={track}
          role="group" aria-roledescription="carousel" aria-label="Guest reviews"
          className="relative -mx-5 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {reviews.map((r, i) => <Card key={i} r={r} i={i} mobile={mobile} active={visible && index === i} />)}
        </div>

        {/* Phones: swipe, or tap a dot. Nothing advances automatically. */}
        <div className="mt-6 flex items-center justify-center md:hidden">
          {reviews.map((_, i) => (
            <button key={i} type="button" aria-label={`Show review ${i + 1} of ${reviews.length}`} aria-current={index === i} onClick={() => go(i)} className="grid h-12 w-8 place-items-center">
              <span className={`block h-2 rounded-full transition-all duration-200 ${index === i ? 'w-6 bg-gold' : 'w-2 bg-page/40'}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
