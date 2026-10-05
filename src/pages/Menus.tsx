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
    <div className="border-b border-line">
      <h3>
        <button className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-display text-title text-brand" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {title}
          <m.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-title text-gold" aria-hidden="true">+</m.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="pb-6">{children}</div>
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
            <p className="eyebrow mb-4">The recommendation</p>
            <h2>Why Signature?</h2>
            <p className="mt-4">Signature is the Chef's Recommendation: more choice and more distinctive flavour, with Biryani and Chicken Shashlik included. Classic stays the reassuring favourite, and Grand adds premium grills and seafood.</p>
            <p className="mt-4 rounded-btn border border-line bg-white/40 p-4 text-small"><strong>Note:</strong> Biryanis replace the Main and Rice choices.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mb-2 !text-head">Explore each part</h2>
            {JOURNEY.map(s => (
              <Accordion key={s} title={s}><Placeholder label={`Approved ${s} options to be added from the final menu data.`} /></Accordion>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="section bg-sunken pt-16">
        <Stagger className="wrap grid gap-4 md:grid-cols-3">
          {[['/family', 'Family Table', '£59.95', 'Two Signature, two Little Table and a family fruit-cooler pitcher.'], ['/family', 'Little Table', '£9.95', 'A complete choice for children aged 11 and under.'], ['/drinks', 'Signature Coolers', '£4.95 each', 'Bold, refreshing and completely alcohol-free.']].map(([to, t, p, c]) => (
            <Item key={t}><Link to={to} className="card block h-full transition-colors hover:border-gold"><h3>{t}</h3><p className="price mt-2 text-lead text-gold-text">{p}</p><p className="mt-2 text-small">{c}</p></Link></Item>
          ))}
        </Stagger>
        <div className="wrap mt-10 flex flex-wrap gap-4"><BookBtn from="fixed-end" /><Link to="/a-la-carte" className="btn-outline">View Full Dining Menu</Link></div>
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
          <div role="group" aria-label="Menu categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-4 md:mx-0 md:flex-wrap md:px-0">
            {TABS.map(t => (
              <button key={t} aria-pressed={tab === t} onClick={() => { setTab(t); track('menu_category_view', { category: t }) }}
                className={`min-h-12 shrink-0 rounded-full border px-5 text-small font-bold transition-colors ${tab === t ? 'border-brand bg-brand text-page' : 'border-line-strong text-brand hover:border-gold'}`}>{t}</button>
            ))}
          </div>
          <p className="mt-4 text-small">Heat scale and allergen details will be shown here once the approved menu data is added. Please <Link to="/allergens" className="font-bold underline">ask about allergens</Link> before ordering.</p>

          <AnimatePresence mode="wait" initial={false}>
            <m.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-10 space-y-14">
              {(show('Signature Dishes') || tab === 'All') && (
                <div>
                  <h2 className="mb-6 !text-head">House Signatures</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {SIGNATURES.map(d => (
                      <div key={d.id} className="overflow-hidden rounded-card border border-line bg-white/40">
                        <Photo k={d.img ?? 'curry'} w={420} ratio="1/1" alt="" />
                        <p className="p-4 font-display text-lead font-semibold uppercase leading-tight text-brand">{d.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {show('Familiar Curries') && (
                <div>
                  <h2 className="mb-4 !text-head">Familiar Curries</h2>
                  <div className="grid gap-4 md:grid-cols-2"><Placeholder label="CHOOSE YOUR CURRY STYLE: approved styles to be added." /><Placeholder label="CHOOSE YOUR PROTEIN: approved proteins to be added." /></div>
                </div>
              )}
              {show('Grand Dishes') && (
                <div>
                  <h2 className="mb-4 !text-head">Grand Dishes</h2>
                  <ul className="grid gap-4 md:grid-cols-2">{GRAND.map(d => <li key={d.id} className="flex items-center gap-4 rounded-card border border-line p-4 font-bold text-brand"><Diamond className="text-gold" />{d.name}</li>)}</ul>
                </div>
              )}
              {['Starters', 'Rice and Breads', 'Desserts'].filter(show).map(s => (
                <div key={s}><h2 className="mb-4 !text-head">{s}</h2><Placeholder label={`Approved ${s} items and prices to be added.`} /></div>
              ))}
              {show('Drinks') && <div><h2 className="mb-4 !text-head">Drinks</h2><p>See our <Link to="/drinks" className="font-bold underline">alcohol-free drinks menu</Link>.</p></div>}
            </m.div>
          </AnimatePresence>

          <div className="mt-14 flex flex-wrap items-center gap-4 rounded-card bg-brand p-6 text-page md:p-8">
            <p className="mr-auto font-display text-title">Prefer a complete five-part feast?</p>
            <Link to="/fixed-price-menu" className="btn-gold">View Fixed-Price Tables</Link>
            <Link to="/allergens" className="btn-outline-light">Ask About Allergens</Link>
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
            <p className="eyebrow mb-4">Signature Coolers</p>
            <h2>£4.95 each</h2>
            <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
              {COOLERS.map(c => <Item key={c}><div className="flex min-h-16 items-center gap-4 rounded-card border border-line bg-white/40 px-5 font-display text-lead font-semibold text-brand"><Diamond className="text-gold" />{c}</div></Item>)}
            </Stagger>
          </Reveal>
          <Reveal delay={0.1}><div className="overflow-hidden rounded-card"><Photo k="drink" w={720} ratio="4/3" alt="Refreshing alcohol-free cooler" /></div></Reveal>
        </div>
      </section>
      <section className="section bg-sunken pt-16">
        <div className="wrap">
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DRINK_GROUPS.map(g => (
              <Item key={g}><div className="card h-full"><h3>{g}</h3>{g === 'Cooler Pitchers' && <p className="eyebrow mt-2">Made for sharing</p>}<p className="mt-4 text-small text-gold-text font-semibold">Approved items and prices to be added.</p></div></Item>
            ))}
          </Stagger>
          <div className="mt-10"><BookBtn from="drinks-end" /></div>
        </div>
      </section>
    </>
  )
}
