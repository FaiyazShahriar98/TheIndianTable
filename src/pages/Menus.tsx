import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m, Reveal, Stagger, Item } from '../lib/motion'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
import { COOLERS, DRINK_GROUPS, GRAND, JOURNEY, SIGNATURES } from '../data/menu'
import { BookBtn, Diamond, Journey, PageHero, Photo, Placeholder, TableCards } from '../components/ui'

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-emerald/20">
      <h3>
        <button className="flex min-h-[56px] w-full items-center justify-between gap-4 py-3 text-left font-display text-2xl text-emerald" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {title}
          <m.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-3xl text-brass" aria-hidden="true">+</m.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="pb-5">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FixedPrice() {
  useSEO('Fixed-Price Indian Menu', 'Choose Your Table: Classic, Signature or Grand. A complete five-part Indian feast at one clear price in Higher Walton, Preston.')
  return (
    <>
      <PageHero eyebrow="Fixed-price dining" title="Choose your table" copy="Every adult Table begins with one Poppadom and our Chutney Selection. Then choose one item from each part of your five-part feast.">
        <BookBtn light from="fixed" />
      </PageHero>
      <section className="section pb-0 md:pb-0"><div className="wrap"><Journey /></div></section>
      <section className="section"><div className="wrap"><TableCards /></div></section>
      <section className="section pt-0">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-3">The recommendation</p>
            <h2>Why Signature?</h2>
            <p className="mt-4">Signature is the Chef's Recommendation: more choice and more distinctive flavour, with Biryani and Chicken Shashlik included. Classic stays the reassuring favourite, and Grand adds premium grills and seafood.</p>
            <p className="mt-4 rounded-btn border border-emerald/20 bg-white/40 p-4 text-[15px]"><strong>Note:</strong> Biryanis replace the Main and Rice choices.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mb-2 !text-[32px]">Explore each part</h2>
            {JOURNEY.map(s => (
              <Accordion key={s} title={s}><Placeholder label={`Approved ${s} options to be added from the final menu data.`} /></Accordion>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="section bg-cream-200/60 pt-16">
        <Stagger className="wrap grid gap-4 md:grid-cols-3">
          {[['/family', 'Family Table', '£59.95', 'Two Signature, two Little Table and a family fruit-cooler pitcher.'], ['/family', 'Little Table', '£9.95', 'A complete choice for children aged 11 and under.'], ['/drinks', 'Signature Coolers', '£4.95 each', 'Bold, refreshing and completely alcohol-free.']].map(([to, t, p, c]) => (
            <Item key={t}><Link to={to} className="card block h-full transition-colors hover:border-brass"><h3>{t}</h3><p className="price mt-1 text-xl text-brass-600">{p}</p><p className="mt-2 text-[15px]">{c}</p></Link></Item>
          ))}
        </Stagger>
        <div className="wrap mt-10 flex flex-wrap gap-3"><BookBtn from="fixed-end" /><Link to="/a-la-carte" className="btn-outline">View Full Dining Menu</Link></div>
      </section>
    </>
  )
}

const TABS = ['All', 'Starters', 'Familiar Curries', 'Signature Dishes', 'Grand Dishes', 'Rice and Breads', 'Desserts', 'Drinks']

export function ALaCarte() {
  useSEO('À La Carte Indian Menu', 'Dine your way: familiar curries, house signatures, premium grills, rice, breads and desserts at The Indian Table, Higher Walton.')
  const [tab, setTab] = useState('All')
  const show = (t: string) => tab === 'All' || tab === t
  return (
    <>
      <PageHero eyebrow="À la carte" title="Dine your way" copy="Choose familiar curries, house signatures, premium grills, rice, breads and desserts at your own pace.">
        <BookBtn light from="alacarte" />
        <Link to="/fixed-price-menu" className="btn-outline-light">View Fixed-Price Tables</Link>
      </PageHero>
      <section className="section pt-8 md:pt-12">
        <div className="wrap">
          <div role="tablist" aria-label="Menu categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 md:mx-0 md:flex-wrap md:px-0">
            {TABS.map(t => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); track('menu_category_view', { category: t }) }}
                className={`min-h-[44px] shrink-0 rounded-full border px-5 text-sm font-bold transition-colors ${tab === t ? 'border-emerald bg-emerald text-cream' : 'border-emerald/30 text-emerald hover:border-brass'}`}>{t}</button>
            ))}
          </div>
          <p className="mt-4 text-sm">Heat scale and allergen details will be shown here once the approved menu data is added. Please <Link to="/allergens" className="font-bold underline">ask about allergens</Link> before ordering.</p>

          <AnimatePresence mode="wait" initial={false}>
            <m.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-10 space-y-14">
              {(show('Signature Dishes') || tab === 'All') && (
                <div>
                  <h2 className="mb-6 !text-[34px]">House Signatures</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {SIGNATURES.map(d => (
                      <div key={d.id} className="overflow-hidden rounded-card border border-emerald/20 bg-white/40">
                        <Photo k={'curry'} w={420} ratio="1/1" alt="" />
                        <p className="p-3 font-display text-lg font-semibold uppercase leading-tight text-emerald">{d.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {show('Familiar Curries') && (
                <div>
                  <h2 className="mb-4 !text-[34px]">Familiar Curries</h2>
                  <div className="grid gap-4 md:grid-cols-2"><Placeholder label="CHOOSE YOUR CURRY STYLE: approved styles to be added." /><Placeholder label="CHOOSE YOUR PROTEIN: approved proteins to be added." /></div>
                </div>
              )}
              {show('Grand Dishes') && (
                <div>
                  <h2 className="mb-4 !text-[34px]">Grand Dishes</h2>
                  <ul className="grid gap-3 md:grid-cols-2">{GRAND.map(d => <li key={d.id} className="flex items-center gap-3 rounded-card border border-emerald/20 p-4 font-bold text-emerald"><Diamond className="text-brass" />{d.name}</li>)}</ul>
                </div>
              )}
              {['Starters', 'Rice and Breads', 'Desserts'].filter(show).map(s => (
                <div key={s}><h2 className="mb-4 !text-[34px]">{s}</h2><Placeholder label={`Approved ${s} items and prices to be added.`} /></div>
              ))}
              {show('Drinks') && <div><h2 className="mb-4 !text-[34px]">Drinks</h2><p>See our <Link to="/drinks" className="font-bold underline">alcohol-free drinks menu</Link>.</p></div>}
            </m.div>
          </AnimatePresence>

          <div className="mt-14 flex flex-wrap items-center gap-3 rounded-card bg-emerald p-6 text-cream md:p-8">
            <p className="mr-auto font-display text-2xl">Prefer a complete five-part feast?</p>
            <Link to="/fixed-price-menu" className="btn-gold">View Fixed-Price Tables</Link>
            <button className="btn-outline-light" disabled title="Print menu PDF to be supplied">Download Print Menu</button>
          </div>
        </div>
      </section>
    </>
  )
}

export function Drinks() {
  useSEO('Alcohol-Free Drinks & Mocktails', 'Signature Coolers, lassi, milkshakes and 0.0% lagers. Bold, refreshing and completely alcohol-free at The Indian Table, Higher Walton.')
  return (
    <>
      <PageHero eyebrow="Drinks" title="Raise a glass to the table" copy="Bold, refreshing and completely alcohol-free.">
        <BookBtn light from="drinks" />
        <Link to="/fixed-price-menu" className="btn-outline-light">View Dining Menus</Link>
      </PageHero>
      <section className="section">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-3">Signature Coolers</p>
            <h2>£4.95 each</h2>
            <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
              {COOLERS.map(c => <Item key={c}><div className="flex min-h-[64px] items-center gap-3 rounded-card border border-emerald/25 bg-white/40 px-5 font-display text-xl font-semibold text-emerald"><Diamond className="text-brass" />{c}</div></Item>)}
            </Stagger>
          </Reveal>
          <Reveal delay={0.1}><div className="overflow-hidden rounded-card"><Photo k="drink" w={720} ratio="4/3" alt="Refreshing alcohol-free cooler (placeholder photograph)" /></div></Reveal>
        </div>
      </section>
      <section className="section bg-cream-200/60 pt-16">
        <div className="wrap">
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DRINK_GROUPS.map(g => (
              <Item key={g}><div className="card h-full"><h3>{g}</h3>{g === 'Cooler Pitchers' && <p className="eyebrow mt-1">Made for sharing</p>}<p className="mt-3 text-sm text-brass-600 font-semibold">Approved items and prices to be added.</p></div></Item>
            ))}
          </Stagger>
          <div className="mt-10"><BookBtn from="drinks-end" /></div>
        </div>
      </section>
    </>
  )
}
