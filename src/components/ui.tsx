import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { img, PHOTOS } from '../config'
import { JOURNEY, TIERS } from '../data/menu'
import { Item, Reveal, Stagger } from '../lib/motion'
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
    <section className={`relative overflow-hidden ${dark ? 'on-dark bg-emerald text-cream' : ''}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-brass/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-brass/15" />
      <div className="wrap relative py-14 md:py-24">
        <Reveal className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1>{title}</h1>
          {copy && <p className={`mt-5 max-w-2xl text-lg ${dark ? 'text-cream/85' : ''}`}>{copy}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
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

export function Journey({ dark = false }: { dark?: boolean }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {JOURNEY.map((s, i) => (
        <Item key={s} className={`rounded-card border p-4 text-center ${dark ? 'border-brass/40' : 'border-emerald/25 bg-white/40'}`}>
          <span className="font-display text-4xl text-brass">{i + 1}</span>
          <span className={`mt-1 block text-sm font-bold uppercase tracking-wider ${dark ? 'text-cream' : 'text-emerald'}`}>{s}</span>
        </Item>
      ))}
    </Stagger>
  )
}

/** Classic / Signature / Grand. Signature sits in the middle, emphasised with scale, fill and double keyline. */
export function TableCards() {
  return (
    <Stagger className="grid items-center gap-5 md:grid-cols-3">
      {TIERS.map(t => (
        <Item key={t.id} className={t.featured ? 'order-none md:z-10 md:scale-[1.07]' : ''}>
          <article
            className={`relative h-full rounded-card p-7 md:p-8 ${t.featured
              ? 'on-dark bg-emerald text-cream outline outline-1 outline-offset-0 outline-brass ring-1 ring-inset ring-brass/50 [box-shadow:inset_0_0_0_6px_#12382E,inset_0_0_0_7px_rgba(199,162,74,.55)] md:py-12'
              : 'border border-emerald/40 bg-cream'}`}
          >
            {t.featured && <p className="eyebrow mb-3">Chef's Recommendation</p>}
            <h3 className={t.featured ? '!text-cream' : ''}>{t.name}</h3>
            <p className="mt-2 flex items-baseline gap-2"><span className={`price font-display text-5xl ${t.featured ? 'text-brass' : 'text-emerald'}`}>{t.price}</span><span className="text-sm opacity-80">per person</span></p>
            <p className={`mt-2 text-sm font-semibold ${t.featured ? 'text-cream/90' : 'text-brass-600'}`}>{t.tag}</p>
            <ul className="mt-5 space-y-2.5 text-[15px]">
              {t.points.map(p => <li key={p} className="flex gap-2.5"><Diamond className="mt-[9px] shrink-0 text-brass" />{p}</li>)}
            </ul>
            <Link to="/book" onClick={() => { track('book_start', { from: t.id }) }} className={`mt-7 w-full ${t.featured ? 'btn-gold' : 'btn-outline'}`}>Choose {t.name.split(' ')[0]}</Link>
          </article>
        </Item>
      ))}
    </Stagger>
  )
}

export function SplitCTA() {
  return (
    <section className="on-dark bg-emerald py-16 text-center text-cream md:py-24">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-3">Tonight at The Indian Table</p>
          <h2 className="mx-auto max-w-2xl">Book tonight. Or order tonight.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BookBtn light from="final" />
            <OrderBtn light from="final" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Placeholder({ label }: { label: string }) {
  return <p className="rounded-btn border border-dashed border-brass-600/60 bg-white/40 p-4 text-sm font-semibold text-brass-600">{label}</p>
}
