import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { SITE } from '../config'
import { track } from '../lib/analytics'
import { XMAS, XMAS_EXTRAS, XMAS_MENUS, type XmasMenu } from '../data/christmas'
import { SnowCap } from './Christmas'

type Props = {
  /** Called when a guest taps "Book this table": the page adds one of that table and scrolls to the form. */
  onBook: (table: XmasMenu['id']) => void
  /** False once the booking has been sent -- there's no form to add to any more. */
  canBook: boolean
  /** Which menu tab is showing. Controlled by the page so the form's "View full menu" links can switch it. */
  active: XmasMenu['id']
  onActiveChange: (id: XmasMenu['id']) => void
}

const Deco = ({ src, className, w, h }: { src: string; className: string; w: number; h: number }) => (
  <img src={src} alt="" aria-hidden="true" width={w} height={h} loading="lazy" decoding="async" className={`pointer-events-none absolute ${className}`} />
)

/** Cream "menu card" in the style of the client's flyers: dark-green headings, gold course labels. */
function MenuCard({ menu, onBook, canBook }: { menu: XmasMenu } & Pick<Props, 'onBook' | 'canBook'>) {
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 2200)
    return () => window.clearTimeout(t)
  }, [added])

  return (
    <div className="relative rounded-card border border-gold bg-page p-6 text-ink md:p-8">
      <Deco src="/xmas/bow.png" w={110} h={90} className="-left-4 -top-6 w-14 md:-left-6 md:w-[72px]" />
      <Deco src="/xmas/holly.png" w={101} h={78} className="-right-3 -top-6 w-12 md:-right-5 md:w-16" />

      <div className="text-center">
        <h3 className="!text-title !text-brand md:!text-head">{menu.title}</h3>
        {menu.price && (
          <p className="mt-2 font-bold text-gold-text">{menu.price} <span className="font-semibold text-ink/70">• {menu.priceNote}</span></p>
        )}
        <div className="mx-auto mt-4 h-px w-2/3 bg-gold/70" aria-hidden="true" />
      </div>

      <div className="mt-6 divide-y divide-gold/60">
        {menu.courses.map(c => (
          <section key={c.label} className="py-5 first:pt-0 last:pb-0">
            <h4 className="text-small font-bold uppercase tracking-[0.14em] text-gold-text">
              {c.label}{c.note && <span className="ml-3 font-normal normal-case tracking-normal text-ink/75">{c.note}</span>}
            </h4>
            {c.feature ? (
              <p className="mt-3 rounded-btn border border-gold bg-white/60 px-4 py-3 font-display text-lead font-bold text-brand">
                <span aria-hidden="true" className="mr-2 text-gold">✦</span>{c.title}
              </p>
            ) : (
              <>
                {c.title && <p className="mt-2 font-display text-title font-bold text-brand">{c.title}</p>}
                {c.intro && <p className="mt-1 text-body">{c.intro}</p>}
                {c.text && <p className="mt-2 text-body">{c.text}</p>}
                {c.items && <ul className={`dash mt-2 grid gap-1.5 text-body ${c.cols ? 'sm:grid-cols-2 sm:gap-x-8' : ''}`}>{c.items.map(i => <li key={i}>{i}</li>)}</ul>}
                {c.footnote && <p className="mt-3 text-small font-semibold text-brand">{c.footnote}</p>}
              </>
            )}
          </section>
        ))}
      </div>

      {menu.banner && <p className="mt-6 rounded-btn bg-brand px-4 py-3 text-center text-small font-bold uppercase tracking-wider text-page">{menu.banner}</p>}

      {canBook && (
        <div className="mt-8 text-center">
          <span className="relative inline-flex">
            <button
              type="button"
              onClick={() => { onBook(menu.id); setAdded(true); track('book_start', { from: 'christmas-menu', table: menu.id }) }}
              className="btn !px-8 border border-[#E2BF6A] bg-[#C8102E] font-display !text-lead text-white shadow-lg hover:brightness-110"
            >
              {added ? '✓ Added to your booking' : <>Book the {menu.tab} Table <span aria-hidden="true" className="ml-1">→</span></>}
            </button>
            <SnowCap />
          </span>
          <p className="mt-3 text-small text-ink/70">Adds one guest to this table in your booking below.</p>
          <p className="sr-only" role="status" aria-live="polite">{added ? `One guest added to the ${menu.title}.` : ''}</p>
        </div>
      )}
    </div>
  )
}

/** Everything a guest needs to know before booking: seatings, prices, the three menus, and the extras. */
export default function ChristmasMenus({ onBook, canBook, active, onActiveChange }: Props) {
  const setActive = onActiveChange
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const menu = XMAS_MENUS.find(m => m.id === active)!

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = XMAS_MENUS.length
    const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n : -1
    if (next < 0) return
    e.preventDefault()
    setActive(XMAS_MENUS[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <div className="wrap relative">
      <div className="relative mx-auto max-w-3xl text-center">
        <Deco src="/xmas/bells.png" w={89} h={105} className="-left-2 top-0 hidden w-16 md:block lg:-left-24 lg:w-20" />
        <Deco src="/xmas/bells.png" w={89} h={105} className="-right-2 top-0 hidden w-16 scale-x-[-1] md:block lg:-right-24 lg:w-20" />
        <p className="eyebrow mb-3">Christmas Day {XMAS.year}</p>
        <h2 className="!text-head md:!text-big">The Christmas Table, your way</h2>
        <p className="mt-3 text-page/85">Traditional turkey roast • Indian favourites</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-[1.1fr_1fr]">
        <div className="relative rounded-btn border border-gold bg-brand px-4 py-4 text-center font-display text-title font-bold text-page">
          <SnowCap />
          {XMAS.times[0]} <span className="mx-2 text-gold">|</span> {XMAS.times[1]}
          <span className="mt-1 block font-sans text-micro font-bold uppercase tracking-[0.18em] text-gold">Two seatings</span>
        </div>
        <div className="rounded-btn border border-gold/70 px-4 py-3 text-center text-small font-bold text-page">
          <span className="block">Adults {XMAS.adult} • Children {XMAS.childAges} {XMAS.child}</span>
          <span className="mt-1 block font-normal text-page/80">Ages {XMAS.freeUnder} and under eat FREE</span>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-3xl rounded-btn bg-gold px-4 py-2.5 text-center text-small font-bold uppercase tracking-[0.14em] text-brand-deep">Advance bookings only</p>

      <div id="christmas-menu-tabs" className="mx-auto mt-12 max-w-3xl scroll-mt-24">
        <div role="tablist" aria-label="Christmas menus" className="grid grid-cols-3 gap-2">
          {XMAS_MENUS.map((m, i) => (
            <button
              key={m.id} ref={el => { tabs.current[i] = el }} role="tab" id={`xtab-${m.id}`} aria-selected={active === m.id} aria-controls={`xpanel-${m.id}`}
              tabIndex={active === m.id ? 0 : -1} onKeyDown={e => onKey(e, i)} onClick={() => { setActive(m.id); track('christmas_menu_view', { menu: m.id }) }}
              className={`btn !min-h-12 !px-2 text-small sm:text-body ${active === m.id ? 'bg-gold text-brand-deep' : 'border border-gold/70 text-page hover:bg-white/10'}`}
            >
              {m.tab}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`xpanel-${menu.id}`} aria-labelledby={`xtab-${menu.id}`} className="mt-8">
          <MenuCard menu={menu} onBook={onBook} canBook={canBook} />
        </div>
      </div>

      <div className="relative mx-auto mt-16 max-w-3xl">
        <Deco src="/xmas/gifts-tall.png" w={135} h={82} className="-top-14 left-1/2 w-24 -translate-x-1/2 md:w-28" />
        <h3 className="pt-14 text-center !text-lead !text-gold md:pt-16">More than a meal</h3>
        <p className="mt-1 text-center text-small text-page/80">Festive extras planned</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {XMAS_EXTRAS.map(x => (
            <li key={x.title} className="rounded-btn border border-gold/60 bg-black/15 p-4">
              <p className="font-bold uppercase tracking-wider text-page"><span aria-hidden="true" className="mr-2 text-gold">✦</span>{x.title}</p>
              <p className="mt-1 text-small text-page/80">{x.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-small font-semibold text-page/90">Please enquire for confirmed entertainment details.</p>
      </div>

      <div className="relative mx-auto mt-14 max-w-3xl rounded-card border border-gold/70 bg-black/15 p-6 text-center">
        <Deco src="/xmas/wreath.png" w={83} h={102} className="-right-2 -top-8 w-16 md:-right-4 md:w-20" />
        <p className="eyebrow mb-2">Christmas Day at home</p>
        <p className="font-display text-title font-bold text-page">Pre-order takeaway</p>
        <p className="mt-1 text-small text-page/80">Collection and delivery available • Vegetarian dishes available • Other requests? Please enquire.</p>
        <a href={SITE.ORDER_URL} onClick={() => track('order_start', { from: 'christmas-page' })} className="btn-outline mt-4">Pre-order takeaway</a>
      </div>

      <p className="mt-12 text-center">
        <span className="relative inline-flex">
          <a href="#christmas-form" className="btn-gold">Go to your booking ↓</a>
          <SnowCap />
        </span>
      </p>
    </div>
  )
}
