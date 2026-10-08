import { Link } from 'react-router-dom'
import { m, Reveal, Stagger, Item, useReducedMotion } from '../lib/motion'
import { SITE, openStatus } from '../config'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
// Hidden for now -- client will supply real reviews later. Uncomment to restore.
// import Reviews from '../components/Reviews'
import { BookBtn, Headline, Journey, OrderBtn, CountUp, BgPhoto, Photo, Placeholder, Plate, SplitCTA, TableCards, spotMove } from '../components/ui'

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

  return (
    <>
      {/* 1 Hero */}
      <section className="on-dark grain relative isolate overflow-hidden">
        <BgPhoto k="interior" side="full" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-52 top-2/3 h-[560px] w-[560px] rounded-full border border-gold/15" />
        <div className="wrap relative grid items-center gap-10 py-12 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6">Family-led Indian dining in Higher Walton</p>
            <h1 className="!text-page">A complete Indian feast. <span className="text-gold">One clear price.</span></h1>
            <p className="mt-6 max-w-xl text-lead text-page/85">
              Freshly cooked and served to your table. Choose Classic, Signature or Grand - or order your favourites for collection, local delivery or Bring to Car.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <BookBtn light from="hero" />
              <OrderBtn light label="Order Takeaway" from="hero" />
            </div>
            <p className="mt-8 text-small font-semibold text-page/80 price">
              Classic £14.95 <span className="mx-2 text-gold">|</span> Signature £18.95 <span className="mx-2 text-gold">|</span> Grand £25.95 <span className="mx-2 text-gold">|</span> Little Table £9.95
            </p>
            <p className="mt-2 text-small text-page/70">Alcohol-free drinks · Family Table £59.95 · 350 Higher Walton Road, Preston</p>
          </div>
          <div className="mt-16 lg:col-span-5 lg:mt-0">
            <Plate k="curry" w={640} dir="cw" steam priority alt="Aerial view of a kadai of curry finished with fresh coriander" />
          </div>
        </div>
      </section>

      {/* 2 Intent row */}
      <section className="section pb-0 md:pb-0">
        <Stagger className="wrap grid gap-4 md:grid-cols-3">
          {[
            ['/book', 'Dine In', 'Table service, one clear price.', 'dining'],
            [SITE.ORDER_URL, 'Order Takeaway', 'Collection or local delivery.', 'tikka'],
            ['/bring-to-car', 'Bring to Car', 'Order online. We bring it out.', 'naan'],
          ].map(([to, t, c, p]) => {
            const external = to.startsWith('http')
            const inner = (
              <>
                <div className="aspect-[16/9] overflow-hidden"><Photo k={p as 'dining'} w={640} ratio="16/9" alt="" className="transition-transform duration-200 group-hover:rotate-1 group-hover:scale-105" /></div>
                <div className="flex items-center justify-between p-6">
                  <div><h3>{t}</h3><p className="text-small">{c}</p></div>
                  <span aria-hidden="true" className="text-title text-gold transition-transform group-hover:translate-x-1">→</span>
                </div>
              </>
            )
            const cls = "spot group block overflow-hidden rounded-card border border-line bg-white/40 transition-colors duration-200 hover:border-gold"
            return (
              <Item key={to}>
                {external
                  ? <a href={to} onPointerMove={spotMove} className={cls}>{inner}</a>
                  : <Link to={to} onPointerMove={spotMove} className={cls}>{inner}</Link>}
              </Item>
            )
          })}
        </Stagger>
      </section>

      {/* 3 Choose your table */}
      <section className="section relative isolate">
        <BgPhoto k="spread" tone="light" />
        <div className="wrap">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow mb-4">Choose Your Table</p>
            <Headline>Three Tables. One relaxed evening.</Headline>
            <p className="mt-4">Every adult Table begins with one Poppadom and our Chutney Selection. Then choose one item from each part of your five-part feast.</p>
          </Reveal>
          <TableCards />
          <p className="mt-8 text-center"><Link to="/fixed-price-menu" className="btn-outline">View the Fixed-Price Menu</Link></p>
        </div>
      </section>

      {/* 4 Journey */}
      <section className="section bg-sunken">
        <div className="wrap">
          <Reveal className="mb-12 max-w-xl">
            <Headline>The five-part feast</Headline>
            <p className="mt-4">One poppadom and chutney to begin, then one choice from every part.</p>
          </Reveal>
          <Journey />
        </div>
      </section>

      {/* 5 Why */}
      <section className="section">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal><div className="overflow-hidden rounded-card"><Photo k="room" w={760} ratio="4/3" alt="Warm, welcoming restaurant dining room" /></div></Reveal>
          <div>
            <Reveal><p className="eyebrow mb-4">Our Table, Your Table</p><Headline>Why families choose The Indian Table</Headline></Reveal>
            <Stagger className="mt-8 divide-y divide-line border-y border-line">
              {WHY.map(([t, c], i) => (
                <Item key={t} className="grid grid-cols-[48px_1fr] items-baseline gap-4 py-6"><span className="font-display text-title text-gold-text">0{i + 1}</span><div><h3 className="!text-lead uppercase tracking-wide">{t}</h3><p className="mt-2 text-small">{c}</p></div></Item>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* 6 Family Table */}
      <section className="on-dark grain section relative isolate">
        <BgPhoto k="dining" side="right" />
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">Family Table</p>
            <h2>Different favourites. One table. One clear family price.</h2>
            <p className="price mt-4 font-display text-price text-gold"><CountUp to={59.95} /></p>
            <ul className="dash mt-6 space-y-2">
              {['Two Signature Table feasts', 'Two Little Table feasts', 'One family fruit-cooler pitcher'].map(p => <li key={p}>{p}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4"><Link to="/family" className="btn-gold">See Family Options</Link><BookBtn label="Book a Family Table" table="family" light from="family-home" /></div>
          </Reveal>
          <Reveal delay={0.1}><div className="py-4"><Plate k="spread" w={600} dir="ccw" alt="Creamy butter chicken served for the table" /></div></Reveal>
        </div>
      </section>

      {/* 7 Takeaway */}
      <section className="section">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <p className="eyebrow mb-4">Curry night at home</p>
            <h2>Complete Meal Choices</h2>
            <p className="mt-2 text-small font-bold uppercase tracking-wider text-gold-text">Direct order exclusives · Designed for 1 to 4 people</p>
            <p className="price mt-4 font-display text-price">£9.95</p>
            <p className="mt-4">Choose collection, local delivery or Bring to Car, then build the meal your family actually wants.</p>
            <div className="mt-6 flex flex-wrap gap-2">{['Collection', 'Delivery', 'Bring to Car'].map(x => <span key={x} className="rounded-full border border-line-strong px-4 py-2 text-small font-bold text-brand">{x}</span>)}</div>
            <div className="mt-8"><OrderBtn label="Order Takeaway" from="home-box" /></div>
          </Reveal>
          <Reveal><div className="overflow-hidden rounded-card"><Photo k="street" w={760} ratio="4/3" alt="Takeaway Indian street food" /></div></Reveal>
        </div>
      </section>

      {/* 8 Signature photography */}
      <section className="section bg-sunken pt-16">
        <div className="wrap">
          <Reveal className="mb-10 max-w-xl"><p className="eyebrow mb-4">From our kitchen</p><h2>House signatures</h2></Reveal>
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {(['spread', 'butter', 'biryani', 'paneer'] as const).map((k, i) => (
              <Item key={k} className={i % 2 ? 'md:mt-10' : ''}><div className="overflow-hidden rounded-card"><Photo k={k} w={520} ratio="3/4" alt="Signature dish" className="transition-transform duration-200 hover:scale-105" /></div></Item>
            ))}
          </Stagger>
          <p className="mt-8"><Link to="/a-la-carte" className="btn-outline">Dine Your Way</Link></p>
        </div>
      </section>

      {/* 9 Reviews -- hidden for now, client will supply real reviews later. Uncomment to restore. */}
      {/* <Reviews /> */}

      {/* 10 Location */}
      <section className="section pt-0">
        <div className="wrap">
          <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-2">
            <div className="bg-white/40 p-8 md:p-10">
              <p className="eyebrow mb-4">Find your table</p>
              <h2>Higher Walton, Preston</h2>
              <p className="mt-4"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${open ? 'bg-success' : 'bg-gold'}`} /><strong>{open ? 'Open now' : 'Currently closed'}</strong></p>
              <p className="mt-2">{SITE.address}</p>
              <ul className="mt-4 space-y-2 text-small">{SITE.hours.map(h => <li key={h.days}><strong>{h.days}:</strong> {h.open} to {h.close}</li>)}</ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <a href={SITE.MAP_URL} target="_blank" rel="noopener" onClick={() => track('directions_click')} className="btn-primary">Get Directions</a>
                <a href={SITE.phoneHref} onClick={() => track('phone_click')} className="btn-outline">Call Us</a>
              </div>
            </div>
            <iframe title="Map of The Indian Table" loading="lazy" className="min-h-80 w-full border-0" src="https://www.google.com/maps?q=350+Higher+Walton+Road+Preston+PR5+4HU&output=embed" />
          </div>
        </div>
      </section>

      <SplitCTA />
    </>
  )
}
