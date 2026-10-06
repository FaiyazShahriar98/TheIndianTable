import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m } from '../lib/motion'
import { SITE } from '../config'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
import { CATEGORIES, ORDER_DISHES } from '../data/menu'
import { PageHero, Photo } from '../components/ui'

type Mode = 'Collection' | 'Delivery' | 'Bring to Car'
const MODES: { m: Mode; d: string }[] = [
  { m: 'Collection', d: 'Pick up from the restaurant.' },
  { m: 'Delivery', d: 'Local delivery. Postcode checked at checkout.' },
  { m: 'Bring to Car', d: 'Order online, we bring it out to you.' },
]
const gbp = (n: number) => `£${n.toFixed(2)}`

function ModeIcon({ mode }: { mode: Mode }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" {...p}>
      {mode === 'Collection' && <><path d="M6 8h12l-1 12H7z" /><path d="M9 8a3 3 0 0 1 6 0" /></>}
      {mode === 'Delivery' && <><circle cx="6" cy="17" r="2.5" /><circle cx="18" cy="17" r="2.5" /><path d="M8.5 17H14l2.5-8H19M11 9H7M14 9l-1.5 5" /></>}
      {mode === 'Bring to Car' && <><path d="M4 16v-4l2-5h12l2 5v4z" /><path d="M4 12h16" /><circle cx="8" cy="16.5" r="1.5" /><circle cx="16" cy="16.5" r="1.5" /></>}
    </svg>
  )
}

export default function Order() {
  useSEO('Indian Takeaway Higher Walton', 'Restaurant food, your way. Order direct for collection, local delivery or Bring to Car from The Indian Table, Higher Walton, Preston.')
  const [mode, setMode] = useState<Mode | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [needMode, setNeedMode] = useState(false)
  useEffect(() => {
    if (!open && !done) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setDone(false) } }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [open, done])

  const lines = useMemo(() => ORDER_DISHES.filter(d => cart[d.id]).map(d => ({ d, q: cart[d.id] })), [cart])
  const total = lines.reduce((s, l) => s + (l.d.price ?? 0) * l.q, 0)
  const count = lines.reduce((s, l) => s + l.q, 0)
  const hasUnpriced = lines.some(l => l.d.price === undefined)

  const add = (id: string, delta: number) => {
    if (delta > 0) track('add_to_basket', { item: id })
    setCart(c => { const q = (c[id] || 0) + delta; const n = { ...c }; if (q <= 0) delete n[id]; else n[id] = q; return n })
  }
  const pick = (x: Mode) => { setMode(x); setNeedMode(false); track('fulfilment_selected', { method: x }) }

  const cats = CATEGORIES.map(c => ({ c, items: ORDER_DISHES.filter(d => d.cat === c) }))
  const suggest = ORDER_DISHES.filter(d => d.cat === 'Drinks').slice(0, 2)

  const Basket = (
    <div className="card !p-6">
      <div className="flex items-center justify-between"><h3 className="!text-title">Your order</h3>{mode && <span className="rounded-full bg-brand px-4 py-2 text-micro font-bold text-page">{mode}</span>}</div>
      {lines.length === 0 ? (
        <p className="mt-4 text-small">Your basket is empty. Add a dish to get started.</p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-line">
            {lines.map(({ d, q }) => (
              <li key={d.id} className="flex items-center justify-between gap-4 py-2 text-small">
                <span className="font-semibold">{d.name}</span>
                <span className="flex items-center gap-2">
                  <button aria-label={`Remove one ${d.name}`} className="h-12 w-12 rounded-full border border-line-strong font-bold" onClick={() => add(d.id, -1)}>−</button>
                  <span className="w-4 text-center">{q}</span>
                  <button aria-label={`Add one ${d.name}`} className="h-12 w-12 rounded-full border border-line-strong font-bold" onClick={() => add(d.id, 1)}>+</button>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between font-bold text-brand"><span>Total</span><span className="price">{gbp(total)}</span></p>
          {hasUnpriced && <p className="mt-2 text-micro text-gold-text font-semibold">Some dishes are awaiting approved prices.</p>}
          <p className="mt-4 text-micro">Please <Link className="font-bold underline" to="/allergens">check allergen information</Link> before you pay.</p>
          {needMode && !mode && <p role="alert" className="err">Please choose Collection, Delivery or Bring to Car first.</p>}
          <button className="btn-primary mt-4 w-full" onClick={() => { if (!mode) { setNeedMode(true); return } setOpen(false); setDone(true); track('purchase', { value: total, method: mode }) }}>Place Demo Order</button>
        </>
      )}
    </div>
  )

  return (
    <>
      <PageHero eyebrow="Takeaway" title="Restaurant food. Your way." copy="Order direct for collection, local delivery or Bring to Car." />
      <section className="section pb-8 md:pb-10">
        <div className="wrap">
          <p className="eyebrow mb-2">Step 1</p>
          <h2 className="!text-head">How would you like it?</h2>
          <p className="mb-6 mt-2 text-small">{mode ? 'Change your choice any time.' : 'Tap one to choose. You can change it later.'}</p>
          <div role="group" aria-label="Fulfilment method" className="grid gap-4 md:grid-cols-3">
            {MODES.map(x => {
              const on = mode === x.m
              return (
                <button key={x.m} type="button" aria-pressed={on} onClick={() => pick(x.m)}
                  className={`group relative flex flex-col gap-4 rounded-card border-2 p-6 text-left transition duration-200 active:scale-[0.98] md:hover:-translate-y-1 ${on ? 'border-brand bg-brand text-page' : 'border-line-strong bg-white hover:border-gold'}`}>
                  <span className="flex items-start justify-between gap-4">
                    <span className={`grid h-12 w-12 place-items-center rounded-full ${on ? 'bg-gold text-brand-deep' : 'bg-sunken text-brand'}`}><ModeIcon mode={x.m} /></span>
                    {/* radio-style indicator: empty ring until chosen */}
                    <span aria-hidden="true" className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-colors duration-200 ${on ? 'border-gold bg-gold text-brand-deep' : 'border-line-strong text-transparent group-hover:border-gold'}`}>
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                    </span>
                  </span>
                  <span>
                    <span className={`block font-display text-title font-semibold uppercase ${on ? 'text-page' : 'text-brand'}`}>{x.m}</span>
                    <span className={`mt-2 block text-small ${on ? 'text-page/85' : ''}`}>{x.d}</span>
                  </span>
                  <span className={`mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-btn px-6 text-body font-bold transition-colors duration-200 ${on ? 'bg-gold text-brand-deep' : 'bg-brand text-page group-hover:bg-brand-hover'}`}>
                    {on ? 'Selected' : `Select ${x.m}`}
                    {!on && <span aria-hidden="true">→</span>}
                  </span>
                </button>
              )
            })}
          </div>
          {mode === 'Bring to Car' && <p className="mt-4 text-small">You will be asked for your collection time, car registration and colour at checkout. <a href="/bring-to-car" className="font-bold underline">How it works</a></p>}
          {mode === 'Delivery' && <p className="mt-4 text-small">Delivery area and estimated times are supplied by the ordering provider. Delivery postcode is checked at checkout.</p>}
          <p className="mt-4 text-small">Estimated times: confirmed by the ordering provider. {SITE.ORDER_URL ? '' : 'Live ordering link to be connected.'} Prefer to phone? <a href={SITE.phoneHref} className="font-bold underline">{SITE.phone}</a></p>
        </div>
      </section>

      <section className="section pt-4 md:pt-6">
        <div className="wrap grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <div className="on-dark overflow-hidden rounded-card bg-brand text-page md:grid md:grid-cols-5">
              <div className="p-8 md:col-span-3 md:p-10">
                <p className="eyebrow mb-2">Direct-order exclusive · Designed for 3 to 4</p>
                <h2>Family Feast Box</h2>
                <p className="price mt-2 font-display text-price text-gold">£29.95</p>
                <button className="btn-gold mt-6" onClick={() => add('ffb', 1)}>Add to Order</button>
              </div>
              <div className="md:col-span-2"><Photo k="spread" w={560} ratio="4/3" alt="Family feast box" /></div>
            </div>

            {cats.map(({ c, items }) => (
              <div key={c}>
                <h2 className="mb-4 !text-head">{c}</h2>
                {items.length === 0 ? (
                  <p className="rounded-btn border border-dashed border-gold-text/60 bg-white/40 p-4 text-small font-semibold text-gold-text">Approved items and prices to be added.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map(d => (
                      <div key={d.id} className="flex items-center gap-4 rounded-card border border-line bg-white/40 p-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[12px]"><Photo k={d.img ?? 'curry'} w={128} ratio="1/1" alt="" /></div>
                        <div className="min-w-0 flex-1"><p className="font-bold leading-tight text-brand">{d.name}</p><p className="price text-small">{d.price !== undefined ? gbp(d.price) : 'Price to be added'}</p></div>
                        <m.button whileTap={{ scale: 0.92 }} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-lead text-page" aria-label={`Add ${d.name}`} onClick={() => add(d.id, 1)}>+</m.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {count > 0 && (
              <div className="card">
                <h3>Complete your order</h3>
                <p className="mt-2 text-small">Optional extras that go well with your choice.</p>
                <div className="mt-4 flex flex-wrap gap-2">{suggest.map(d => <button key={d.id} className="btn-outline min-h-12" onClick={() => add(d.id, 1)}>+ {d.name} {gbp(d.price!)}</button>)}</div>
              </div>
            )}
          </div>
          <aside className="hidden lg:sticky lg:top-24 lg:block">{Basket}</aside>
        </div>
      </section>

      {/* Mobile sticky basket */}
      {count > 0 && (
        <m.button initial={{ y: 80 }} animate={{ y: 0 }} onClick={() => setOpen(true)} className="fixed inset-x-4 bottom-4 z-30 flex min-h-14 items-center justify-between rounded-btn bg-brand px-5 font-bold text-page lg:hidden">
          <span>{mode ?? 'Choose method'} · {count} {count === 1 ? 'item' : 'items'}</span><span className="price">{gbp(total)} · View</span>
        </m.button>
      )}
      <AnimatePresence>
        {open && (
          <m.div className="fixed inset-0 z-50 flex items-end bg-ink/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <m.div role="dialog" aria-modal="true" aria-label="Basket" onClick={e => e.stopPropagation()} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.25 }} className="max-h-[85dvh] w-full overflow-y-auto rounded-t-[24px] bg-page p-4">
              {Basket}<button className="btn-outline mt-4 w-full" onClick={() => setOpen(false)}>Keep browsing</button>
            </m.div>
          </m.div>
        )}
        {done && (
          <m.div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <m.div role="dialog" aria-modal="true" aria-label="Order confirmation" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-md bg-page text-center">
              <h3>Prototype order placed</h3>
              <p className="mt-2 text-small">This is a demo basket. No payment was taken. Live ordering will connect to the provider via ORDER_URL.</p>
              <button className="btn-primary mt-6" onClick={() => { setDone(false); setCart({}) }}>Done</button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
