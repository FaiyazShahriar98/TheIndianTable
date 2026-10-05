import { Link } from 'react-router-dom'
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

export function PageHero({ eyebrow, title, copy, children, dark = true }: { eyebrow?: string; title: string; copy?: string; children?: ReactNode; dark?: boolean }) {
  return (
    <section className={`relative overflow-hidden ${dark ? 'on-dark bg-brand text-page' : ''}`}>
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
  return (
    <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-4">
      <span aria-hidden="true" className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] bg-gold/60 md:block" />
      {JOURNEY.map((s, i) => (
        <li key={s} className="relative flex items-center gap-4 md:flex-col md:items-start md:gap-4">
          <span className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold font-display text-title ${dark ? 'bg-brand text-gold' : 'bg-sunken text-gold-text'}`}>{i + 1}</span>
          <span className={`text-small font-bold uppercase tracking-wider ${dark ? 'text-page' : 'text-brand'}`}>{s}</span>
        </li>
      ))}
    </ol>
  )
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
            className={`spot relative h-full rounded-card p-8 md:p-8 ${t.featured
              ? 'tier-featured on-dark text-page md:py-12'
              : 'border border-line-strong bg-page'}`}
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
    <section className="on-dark bg-brand py-16 text-center text-page md:py-24">
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
