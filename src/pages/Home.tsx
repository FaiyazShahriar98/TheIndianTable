import { Link } from 'react-router-dom'
import { m, Reveal, Stagger, Item, useReducedMotion } from '../lib/motion'
import { SITE, openStatus } from '../config'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
import { BookBtn, Diamond, Journey, OrderBtn, Photo, Placeholder, Rule, SplitCTA, TableCards } from '../components/ui'

const WHY = [
  ['One clear price', 'Know what your complete feast costs before you sit down.'],
  ['Freshly cooked', 'Restaurant food prepared for your order and served to your table.'],
  ['Choice for everyone', "Familiar curries, house signatures, premium grills and children's favourites."],
  ['Your way', 'Dine in, collect, choose local delivery or use Bring to Car.'],
]

export default function Home() {
  useSEO('Family Indian Restaurant in Higher Walton, Preston', 'A complete Indian feast. One clear price. Freshly cooked and served to your table in Higher Walton, Preston. Book a table or order takeaway.')
  const reduce = useReducedMotion()
  const open = openStatus()
  const heroIn = (d: number) => reduce ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <>
      {/* 1 Hero */}
      <section className="on-dark relative overflow-hidden bg-emerald text-cream">
        <div aria-hidden="true" className="pointer-events-none absolute -left-52 top-1/3 h-[560px] w-[560px] rounded-full border border-brass/15" />
        <div className="wrap relative grid items-center gap-10 py-12 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <m.p {...heroIn(0)} className="eyebrow mb-5">Family-led Indian dining in Higher Walton</m.p>
            <m.h1 {...heroIn(0.08)} className="!text-cream">A complete Indian feast. <span className="text-brass">One clear price.</span></m.h1>
            <m.p {...heroIn(0.16)} className="mt-6 max-w-xl text-lg text-cream/85">
              Freshly cooked and served to your table. Choose Classic, Signature or Grand - or order your favourites for collection, local delivery or Bring to Car.
            </m.p>
            <m.div {...heroIn(0.24)} className="mt-8 flex flex-wrap gap-3">
              <BookBtn light from="hero" />
              <OrderBtn light label="Order Takeaway" from="hero" />
            </m.div>
            <m.p {...heroIn(0.32)} className="mt-7 text-sm font-semibold text-cream/80 price">
              Classic £14.95 <span className="mx-1.5 text-brass">|</span> Signature £18.95 <span className="mx-1.5 text-brass">|</span> Grand £25.95 <span className="mx-1.5 text-brass">|</span> Little Table £9.95
            </m.p>
          </div>
          <m.div {...(reduce ? {} : { initial: { opacity: 0, scale: 1.04 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } })} className="lg:col-span-5">
            <div className="overflow-hidden rounded-[24px] border border-brass/50 p-1.5">
              <div className="overflow-hidden rounded-[18px]">
                <Photo k="hero" w={720} ratio="4/5" priority alt="Indian curry bowls and breads shared at a dining table (placeholder photograph)" />
              </div>
            </div>
          </m.div>
        </div>
      </section>

      {/* 2 Intent row */}
      <section className="section pb-0 md:pb-0">
        <Stagger className="wrap grid gap-4 md:grid-cols-3">
          {[
            ['/book', 'Dine In', 'Table service, one clear price.', 'dining'],
            ['/order', 'Order Takeaway', 'Collection or local delivery.', 'tikka'],
            ['/bring-to-car', 'Bring to Car', 'Order online. We bring it out.', 'naan'],
          ].map(([to, t, c, p]) => (
            <Item key={to}>
              <Link to={to} className="group block overflow-hidden rounded-card border border-emerald/25 bg-white/40 transition-colors hover:border-brass">
                <div className="aspect-[16/9] overflow-hidden"><Photo k={p as 'dining'} w={640} ratio="16/9" alt="" className="transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="flex items-center justify-between p-5">
                  <div><h3>{t}</h3><p className="text-[15px]">{c}</p></div>
                  <span aria-hidden="true" className="text-2xl text-brass transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* 3 Choose your table */}
      <section className="section">
        <div className="wrap">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow mb-3">Choose Your Table</p>
            <h2>Three Tables. One relaxed evening.</h2>
            <p className="mt-4">Every adult Table begins with one Poppadom and our Chutney Selection. Then choose one item from each part of your five-part feast.</p>
          </Reveal>
          <TableCards />
          <p className="mt-8 text-center"><Link to="/fixed-price-menu" className="btn-outline">View the Fixed-Price Menu</Link></p>
        </div>
      </section>

      {/* 4 Journey */}
      <section className="section bg-cream-200/60">
        <div className="wrap">
          <Reveal className="mb-10 text-center">
            <Rule />
            <h2 className="mt-6">The five-part feast</h2>
          </Reveal>
          <Journey />
        </div>
      </section>

      {/* 5 Why */}
      <section className="section">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal><div className="overflow-hidden rounded-card"><Photo k="room" w={760} ratio="4/3" alt="Warm, welcoming restaurant dining room (placeholder photograph)" /></div></Reveal>
          <div>
            <Reveal><p className="eyebrow mb-3">Our Table, Your Table</p><h2>Why families choose The Indian Table</h2></Reveal>
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
              {WHY.map(([t, c]) => (
                <Item key={t}><Diamond className="mb-2 text-brass" /><h3 className="!text-xl uppercase tracking-wide">{t}</h3><p className="mt-1 text-[15px]">{c}</p></Item>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* 6 Family Table */}
      <section className="on-dark section bg-emerald text-cream">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-3">Family Table</p>
            <h2>Different favourites. One table. One clear family price.</h2>
            <p className="price mt-4 font-display text-6xl text-brass">£59.95</p>
            <ul className="mt-5 space-y-2.5">
              {['Two Signature Table feasts', 'Two Little Table feasts', 'One family fruit-cooler pitcher'].map(p => <li key={p} className="flex gap-3"><Diamond className="mt-[9px] shrink-0 text-brass" />{p}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/family" className="btn-gold">See Family Options</Link><BookBtn label="Book a Family Table" light from="family-home" /></div>
          </Reveal>
          <Reveal delay={0.1}><div className="overflow-hidden rounded-card border border-brass/50 p-1.5"><div className="overflow-hidden rounded-[14px]"><Photo k="spread" w={760} ratio="4/3" alt="A table of shared Indian dishes (placeholder photograph)" /></div></div></Reveal>
        </div>
      </section>

      {/* 7 Takeaway */}
      <section className="section">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <p className="eyebrow mb-3">Curry night at home</p>
            <h2>Family Feast Box</h2>
            <p className="mt-2 text-sm font-bold uppercase tracking-wider text-brass-600">Direct-order exclusive · Designed for 3 to 4</p>
            <p className="price mt-3 font-display text-5xl">£29.95</p>
            <p className="mt-4">Choose collection, local delivery or Bring to Car, then build the meal your family actually wants.</p>
            <div className="mt-6 flex flex-wrap gap-2">{['Collection', 'Delivery', 'Bring to Car'].map(x => <span key={x} className="rounded-full border border-emerald/30 px-4 py-1.5 text-sm font-bold text-emerald">{x}</span>)}</div>
            <div className="mt-8"><OrderBtn label="Order Takeaway" from="home-box" /></div>
          </Reveal>
          <Reveal><div className="overflow-hidden rounded-card"><Photo k="street" w={760} ratio="4/3" alt="Takeaway Indian street food (placeholder photograph)" /></div></Reveal>
        </div>
      </section>

      {/* 8 Signature photography */}
      <section className="section bg-cream-200/60 pt-16">
        <div className="wrap">
          <Reveal className="mb-10 max-w-xl"><p className="eyebrow mb-3">House Signatures</p><h2>Dishes we are known for</h2></Reveal>
          <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {(['butter', 'tandoori', 'biryani', 'paneer'] as const).map((k, i) => (
              <Item key={k} className={i % 2 ? 'md:mt-10' : ''}><div className="overflow-hidden rounded-card"><Photo k={k} w={520} ratio="3/4" alt="Signature dish (placeholder photograph)" className="transition-transform duration-500 hover:scale-105" /></div></Item>
            ))}
          </Stagger>
          <p className="mt-8"><Link to="/a-la-carte" className="btn-outline">Dine Your Way</Link></p>
        </div>
      </section>

      {/* 9 Reviews */}
      <section className="section">
        <div className="wrap">
          <Reveal className="mb-8"><h2>What our guests say</h2></Reveal>
          <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map(i => <Placeholder key={i} label="ADD VERIFIED REVIEW (platform, customer name and date required)" />)}</div>
        </div>
      </section>

      {/* 10 Location */}
      <section className="section pt-0">
        <div className="wrap">
          <div className="grid overflow-hidden rounded-card border border-emerald/25 lg:grid-cols-2">
            <div className="bg-white/40 p-7 md:p-10">
              <p className="eyebrow mb-3">Find your table</p>
              <h2>Higher Walton, Preston</h2>
              <p className="mt-3"><span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${open ? 'bg-green-600' : 'bg-brass'}`} /><strong>{open ? 'Open now' : 'Currently closed'}</strong></p>
              <p className="mt-2">{SITE.address}</p>
              <ul className="mt-4 space-y-1 text-[15px]">{SITE.hours.map(h => <li key={h.days}><strong>{h.days}:</strong> {h.open} to {h.close}</li>)}</ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={SITE.MAP_URL} target="_blank" rel="noopener" onClick={() => track('directions_click')} className="btn-primary">Get Directions</a>
                <a href={SITE.phoneHref} onClick={() => track('phone_click')} className="btn-outline">Call Us</a>
              </div>
            </div>
            <iframe title="Map of The Indian Table" loading="lazy" className="min-h-[300px] w-full border-0" src="https://www.openstreetmap.org/export/embed.html?bbox=-2.7120%2C53.7230%2C-2.6520%2C53.7530&layer=mapnik" />
          </div>
        </div>
      </section>

      <SplitCTA />
    </>
  )
}
