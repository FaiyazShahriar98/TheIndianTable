import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { img, PHOTOS } from '../config'
import { JOURNEY, TIERS } from '../data/menu'
import { Item, Reveal, Stagger, m, useReducedMotion } from '../lib/motion'
import { track } from '../lib/analytics'

type PhotoKey = keyof typeof PHOTOS

/** Responsive Unsplash placeholder with explicit dimensions (no layout shift) and lazy loading. */
export function Photo({ k, w = 900, ratio = '4/3', alt, className = '', priority = false }: {
  k: PhotoKey; w?: number; ratio?: string; alt: string; className?: string; priority?: boolean
}) {
  const [a, b] = ratio.split('/').map(Number)
  const h = Math.round((w * b) / a)
  const src = (x: number) => `${img(PHOTOS[k], x).replace(/&w=\d+/, `&w=${x}`)}&h=${Math.round((x * b) / a)}`
  return (
    <img
      src={src(w)}
      srcSet={`${src(Math.round(w / 2))} ${Math.round(w / 2)}w, ${src(w)} ${w}w, ${src(w * 2)} ${w * 2}w`}
      sizes={`(min-width:1024px) ${Math.round(w / 1.4)}px, 100vw`}
      width={w} height={h} alt={alt}
      loading={priority ? 'eager' : 'lazy'} decoding="async"
      {...(priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {})}
      className={`h-full w-full object-cover ${className}`}
      style={{ aspectRatio: ratio.replace('/', ' / ') }}
    />
  )
}

export const Diamond = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" className={className}><path d="M5 0l1.4 3.6L10 5 6.4 6.4 5 10 3.6 6.4 0 5l3.6-1.4z" fill="currentColor" /></svg>
)

export const Rule = () => <div className="rule" aria-hidden="true"><Diamond /></div>

export function PageHero({ eyebrow, title, copy, children, dark = true, bg }: { eyebrow?: string; title: string; copy?: string; children?: ReactNode; dark?: boolean; bg?: PhotoKey }) {
  return (
    <section className={`relative isolate overflow-hidden ${dark ? 'on-dark bg-brand text-page' : ''}`}>
      {bg && <BgPhoto k={bg} side="right" />}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-gold/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-gold/15" />
      <div className="wrap relative py-14 md:py-24">
        <Reveal className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1>{title}</h1>
          {copy && <p className={`mt-6 max-w-2xl text-lead ${dark ? 'text-page/85' : ''}`}>{copy}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
        </Reveal>
      </div>
    </section>
  )
}

export const BookBtn = ({ label = 'Book Your Table', from = 'page', light = false }: { label?: string; from?: string; light?: boolean }) => (
  <Link to="/book" onClick={() => track('book_start', { from })} className={light ? 'btn-gold' : 'btn-primary'}>{label}</Link>
)
export const OrderBtn = ({ label = 'Order Takeaway', from = 'page', light = false }: { label?: string; from?: string; light?: boolean }) => (
  <Link to="/order" onClick={() => track('order_start', { from })} className={light ? 'btn-outline-light' : 'btn-outline'}>{label}</Link>
)

/** Five-part feast as one connected path, not five boxed cards. */
export function Journey({ dark = false }: { dark?: boolean }) {
  const reduce = useReducedMotion()
  const go = reduce ? {} : { initial: 'off', whileInView: 'on', viewport: { once: true, margin: '0px 0px -15% 0px' } }
  return (
    <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-4">
      <m.span aria-hidden="true" {...go} variants={{ off: { scaleX: 0 }, on: { scaleX: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
        className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] origin-left bg-gold/60 md:block" />
      {JOURNEY.map((s, i) => (
        <li key={s} className="relative flex items-center gap-4 md:flex-col md:items-start md:gap-4">
          <m.span {...go} variants={{ off: { scale: 0.6, opacity: 0 }, on: { scale: 1, opacity: 1, transition: { duration: 0.3, delay: 0.1 + i * 0.14 } } }}
            className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold font-display text-title ${dark ? 'bg-brand text-gold' : 'bg-sunken text-gold-text'}`}>{i + 1}</m.span>
          <m.span {...go} variants={{ off: { opacity: 0, y: 6 }, on: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 + i * 0.14 } } }}
            className={`text-small font-bold uppercase tracking-wider ${dark ? 'text-page' : 'text-brand'}`}>{s}</m.span>
        </li>
      ))}
    </ol>
  )
}

/** Pauses any ambient CSS animation inside while the element is off-screen. */
function usePauseOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => el.setAttribute('data-paused', e.isIntersecting ? 'false' : 'true'))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

/**
 * Photograph that melts into a section: ghosted, faded toward the text side, tinted by the brand colours.
 * Parent section must be `relative isolate`. Lazy, responsive, decorative (hidden from assistive tech).
 */
export function BgPhoto({ k, tone = 'dark', side = 'right' }: { k: PhotoKey; tone?: 'dark' | 'light'; side?: 'left' | 'right' | 'full' }) {
  const ref = usePauseOffscreen<HTMLDivElement>()
  const dark = tone === 'dark'
  const fade = side === 'full' ? 'bg-brand/70' : side === 'right' ? 'bg-gradient-to-r from-brand via-brand/85 to-brand/20' : 'bg-gradient-to-l from-brand via-brand/85 to-brand/20'
  const src = (w: number) => img(PHOTOS[k], w, 55)
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <img src={src(1280)} srcSet={`${src(640)} 640w, ${src(1280)} 1280w`} sizes="100vw" width={1280} height={720} alt="" loading="lazy" decoding="async"
        className={`kb h-full w-full object-cover ${dark ? 'opacity-30 grayscale' : 'opacity-[0.12] sepia'}`} />
      <div className={`absolute inset-0 ${dark ? fade : 'bg-gradient-to-b from-page via-page/40 to-page'}`} />
    </div>
  )
}

/** Rising steam: soft wisps that drift up and fade. Pure CSS, three staggered paths. */
export function Steam() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 80" className="pointer-events-none absolute -top-16 left-1/2 h-20 w-32 -translate-x-1/2 text-page">
      {[[30, 0], [60, 1.6], [90, 3.2]].map(([x, d]) => (
        <path key={x} className="steam-wisp" style={{ animationDelay: `${d}s` }} d={`M${x} 76c-10-12 10-20 0-32s10-20 0-32`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** Circular "plate" photo that rocks a few degrees clockwise then back, like a wok being worked. */
export function Plate({ k, alt, w = 600, dir = 'cw', steam = false, priority = false, className = '' }: {
  k: PhotoKey; alt: string; w?: number; dir?: 'cw' | 'ccw'; steam?: boolean; priority?: boolean; className?: string
}) {
  const ref = usePauseOffscreen<HTMLDivElement>()
  return (
    <div ref={ref} className={`relative mx-auto aspect-square w-full max-w-md ${className}`}>
      <span aria-hidden="true" className="spin-slow absolute -inset-4 rounded-full border border-dashed border-gold/50" />
      <span aria-hidden="true" className="absolute -inset-2 rounded-full border border-gold/60" />
      <div className="relative h-full w-full overflow-hidden rounded-full bg-sunken">
        <div className={`h-full w-full ${dir === 'cw' ? 'rock' : 'rock rock-rev'}`}>
          <Photo k={k} w={w} ratio="1/1" alt={alt} priority={priority} />
        </div>
      </div>
      {steam && <Steam />}
    </div>
  )
}

/** Number that counts up once when scrolled into view. Screen readers get the final value immediately. */
export function CountUp({ to, prefix = '£', decimals = 2 }: { to: number; prefix?: string; decimals?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(reduce ? to : 0)
  useEffect(() => {
    if (reduce || !ref.current) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / 900); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to, reduce])
  return (<><span ref={ref} aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{v.toFixed(decimals)}</span><span className="sr-only">{prefix}{to.toFixed(decimals)}</span></>)
}

/** Cursor-following glow for hover (React Bits SpotlightCard idea). JS only sets two CSS variables. */
export const spotMove = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/** Heading whose words rise in one after another (React Bits SplitText idea). ~300ms total, text stays in the DOM. */
export function Headline({ children, as: Tag = 'h2', className = '' }: { children: string; as?: 'h1' | 'h2' | 'h3'; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <Tag className={className}>{children}</Tag>
  return (
    <Tag className={className} aria-label={children}>
      {children.split(' ').map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <m.span className="inline-block" initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}>{w}&nbsp;</m.span>
        </span>
      ))}
    </Tag>
  )
}

/** Classic / Signature / Grand. Signature sits in the middle, emphasised with scale, fill and double keyline. */
export function TableCards() {
  return (
    <Stagger className="grid items-center gap-6 md:grid-cols-3">
      {TIERS.map(t => (
        <Item key={t.id} className={t.featured ? 'order-none md:z-10 md:scale-[1.07]' : ''}>
          <article onPointerMove={spotMove}
            className={`relative h-full rounded-card p-8 md:p-8 ${t.featured
              ? 'tier-featured on-dark text-page md:py-12'
              : 'spot border border-line-strong bg-page'}`}
          >
            {t.featured && <p className="eyebrow mb-4">Chef's Recommendation</p>}
            <h3 className={t.featured ? '!text-page' : ''}>{t.name}</h3>
            <p className="mt-2 flex items-baseline gap-2"><span className={`price font-display text-price ${t.featured ? 'text-gold' : 'text-brand'}`}>{t.price}</span><span className="text-small opacity-80">per person</span></p>
            <p className={`mt-2 text-small font-semibold ${t.featured ? 'text-page/90' : 'text-gold-text'}`}>{t.tag}</p>
            <ul className="dash mt-6 space-y-2 text-small">
              {t.points.map(p => <li key={p}>{p}</li>)}
            </ul>
            <Link to="/book" onClick={() => { track('book_start', { from: t.id }) }} className={`mt-8 w-full ${t.featured ? 'btn-gold' : 'btn-outline'}`}>Choose {t.name.split(' ')[0]}</Link>
          </article>
        </Item>
      ))}
    </Stagger>
  )
}

export function SplitCTA() {
  return (
    <section className="on-dark relative isolate bg-brand py-16 text-center text-page md:py-24">
      <BgPhoto k="curry" side="full" />
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-4">Tonight at The Indian Table</p>
          <h2 className="mx-auto max-w-2xl">Book tonight. Or order tonight.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <BookBtn light from="final" />
            <OrderBtn light from="final" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Placeholder({ label }: { label: string }) {
  return <p className="rounded-btn border border-dashed border-gold-text/60 bg-white/40 p-4 text-small font-semibold text-gold-text">{label}</p>
}
