import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { m, Reveal, Stagger, Item, useReducedMotion } from '../lib/motion'
import { submitEnquiry } from '../lib/supabase'
import { SITE, openStatus } from '../config'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
import { BookBtn, Diamond, OrderBtn, PageHero, Photo, Placeholder, SplitCTA } from '../components/ui'
import { openCookiePrefs } from '../components/CookieBanner'

function RoadCar() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden="true" className="relative mt-16 h-16 overflow-hidden">
      <div className="absolute inset-x-0 bottom-2 border-b border-dashed border-gold" />
      <m.svg viewBox="0 0 120 48" className="absolute bottom-2 h-12 w-32 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
        initial={reduce ? false : { left: '-20%' }} whileInView={{ left: '52%' }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} style={{ left: '52%' }}>
        <path d="M6 36V26l12-3 14-12h36l14 12 22 3v10z" fill="rgb(var(--page))" />
        <path d="M34 24l10-9h22l12 9z" />
        <circle cx="32" cy="38" r="7" fill="rgb(var(--gold))" /><circle cx="92" cy="38" r="7" fill="rgb(var(--gold))" />
      </m.svg>
    </div>
  )
}

export function BringToCar() {
  useSEO('Bring to Car', 'Order online, stay comfortable and we will bring your Indian takeaway out to your car. The Indian Table, Higher Walton, Preston.')
  const [sent, setSent] = useState(false)
  const [here, setHere] = useState(false)
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true); track('order_start', { method: 'bring_to_car' }) }
  return (
    <>
      <PageHero bg="naan" eyebrow="Bring to Car" title="Order online. Stay comfortable. We'll bring it out." copy="Choose Bring to Car at checkout, tell us what you are driving, then let us know when you arrive.">
        <a href="#start" className="btn-gold">Start a Bring to Car Order</a>
        <a href={SITE.phoneHref} className="btn-outline-light" onClick={() => track('phone_click')}>Call When You Arrive</a>
      </PageHero>
      <section className="section">
        <div className="wrap">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {[['Order', 'Choose Bring to Car, select a time and pay online.'], ['Arrive', 'Park at the confirmed collection point.'], ['Enjoy', 'Tell us you are here and we will bring out the order.']].map(([t, c], i) => (
              <Item key={t}><div className="card h-full"><span className="font-display text-price text-gold">{i + 1}</span><h3 className="uppercase">{t}</h3><p className="mt-2">{c}</p></div></Item>
            ))}
          </Stagger>
          <RoadCar />
          <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Families', 'Customers with limited mobility', 'Busy collections', 'Poor weather'].map(x => <div key={x} className="flex items-center gap-4 rounded-card border border-line p-4 font-bold text-brand"><Diamond className="text-gold" />{x}</div>)}
          </Reveal>
        </div>
      </section>
      <section id="start" className="section bg-sunken pt-16">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <form onSubmit={submit} className="card space-y-4">
            <h2 className="!text-head">Prototype details</h2>
            <p className="rounded-btn border border-dashed border-gold-text/60 p-4 text-small font-semibold text-gold-text">PROTOTYPE: these fields appear at checkout in the live ordering flow.</p>
            {[['time', 'Collection time', 'time'], ['reg', 'Car registration', 'text'], ['colour', 'Car colour', 'text'], ['mob', 'Mobile number', 'tel']].map(([id, l, t]) => (
              <div key={id}><label className="label" htmlFor={id}>{l}</label><input id={id} type={t} required className="field" /></div>
            ))}
            <button className="btn-primary w-full" type="submit">Save Details</button>
            {sent && (
              <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-btn bg-brand p-4 text-page">
                <p className="font-bold">Details saved (demo).</p>
                <button type="button" className="btn-gold mt-4 w-full" onClick={() => setHere(true)}>I'm Here</button>
                {here && <p role="status" className="mt-4 text-small">Prototype notification only: in the live flow this alerts our team. You can also call <a className="underline" href={SITE.phoneHref}>{SITE.phone}</a>.</p>}
              </m.div>
            )}
          </form>
          <div>
            <h2 className="!text-head">Good to know</h2>
            <ul className="mt-6 space-y-4">
              <li><strong>Where do I park?</strong><br /><span className="text-small">Collection point to be confirmed before launch.</span></li>
              <li><strong>How long will it take?</strong><br /><span className="text-small">We will bring it out as soon as you let us know you are here.</span></li>
              <li><strong>Prefer to phone?</strong><br /><a href={SITE.phoneHref} className="font-bold underline">{SITE.phone}</a></li>
            </ul>
            <div className="mt-8"><OrderBtn label="Order Takeaway" from="btc" /></div>
          </div>
        </div>
      </section>
    </>
  )
}

export function Family() {
  useSEO('Family Indian Restaurant Preston', 'Everyone has a place at our table. Family Table £59.95 and Little Table £9.95 at The Indian Table, Higher Walton, Preston.')
  return (
    <>
      <PageHero bg="dining" eyebrow="Family dining" title="Everyone has a place at our table" copy="Familiar choices for children, broader choices for adults and one relaxed table for the whole family.">
        <BookBtn light label="Book a Family Table" table="family" from="family" />
      </PageHero>
      <section className="section">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="on-dark h-full rounded-card bg-brand p-8 text-page md:p-10">
              <p className="eyebrow mb-2">Family Table</p>
              <p className="price font-display text-price text-gold">£59.95</p>
              <ul className="dash mt-6 space-y-2">{['Two Signature Table feasts', 'Two Little Table feasts', 'One family fruit-cooler pitcher'].map(p => <li key={p}>{p}</li>)}</ul>
              <p className="mt-6 text-page/85">Different favourites. One table. One clear family price.</p>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="card h-full">
              <p className="eyebrow mb-2">Little Table</p>
              <p className="price font-display text-price text-brand">£9.95</p>
              <p className="mt-2 font-semibold">For children aged 11 and under.</p>
              <div className="mt-6 grid gap-4">{['One Starter', 'One Main', 'One Accompaniment'].map(x => <Placeholder key={x} label={`${x.toUpperCase()}: approved choices to be added.`} />)}</div>
            </article>
          </Reveal>
        </div>
      </section>
      <section className="section pt-0">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <Reveal><div className="overflow-hidden rounded-card"><Photo k="dining" w={760} ratio="4/3" alt="Family sharing a meal" /></div></Reveal>
          <Reveal delay={0.1}>
            <h2>Highchairs, allergies and booking notes</h2>
            <p className="mt-4">Tell us how many highchairs you need and any allergies or dietary requirements when you book. For urgent allergy questions, please call us.</p>
            <div className="mt-6 flex flex-wrap gap-4"><BookBtn label="Book a Family Table" table="family" from="family-mid" /><Link to="/allergens" className="btn-outline">Ask About Allergies</Link></div>
          </Reveal>
        </div>
      </section>
      <section className="section pt-0">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <h2>Verified family reviews</h2>
            <div className="mt-6 grid gap-4"><Placeholder label="ADD VERIFIED REVIEW (platform, customer name and date required)" /><Placeholder label="ADD VERIFIED REVIEW (platform, customer name and date required)" /></div>
          </div>
          <div>
            <h2>Family questions</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {[['Can I book without an account?', 'Yes. Choose your date, time and party size, then enter your name, mobile and email. No account is needed.'], ['Can I request highchairs?', 'Yes. Add the number of highchairs you need when you book.'], ['What about allergies?', 'Please tell us when you book and tell your server on the day. For urgent questions, call us.'], ['What is the Little Table?', 'A complete choice for children aged 11 and under at £9.95.']].map(([q, a]) => (
                <div key={q} className="py-4"><dt className="font-bold text-brand">{q}</dt><dd className="mt-2 text-small">{a}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <SplitCTA />
    </>
  )
}

export function OurStory() {
  useSEO('Our Story', 'The Indian Table is a family-led restaurant built around a simple idea: curry night should feel generous, relaxed and easy to understand.')
  const blocks: [string, string][] = [
    ['Why we created The Indian Table', 'Curry night should feel generous, relaxed and easy to understand.'],
    ['From buffet thinking to freshly cooked Tables', 'Our fixed-price Tables bring a starter, main, rice or chips, bread and dessert into one complete experience, freshly cooked and served to your table.'],
    ['What one clear price means', 'You know what your complete feast costs before you sit down.'],
    ['Our place in Higher Walton', 'We are a local, family-led restaurant serving Higher Walton, Walton-le-Dale, Bamber Bridge, Lostock Hall, Farington, Leyland and Preston.'],
  ]
  return (
    <>
      <PageHero bg="room" eyebrow="Our story" title="A local table, built for families" copy="The Indian Table is a family-led restaurant built around a simple idea - curry night should feel generous, relaxed and easy to understand." />
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <Stagger className="space-y-8">{blocks.map(([t, c]) => <Item key={t}><h2 className="!text-head">{t}</h2><p className="mt-2">{c}</p></Item>)}</Stagger>
          <div className="space-y-6"><Photo k="room" w={700} ratio="4/3" alt="Restaurant interior" className="rounded-card" /><Placeholder label="REAL TEAM PHOTOGRAPHS AND BIOGRAPHIES TO BE SUPPLIED BY THE OWNER" /></div>
        </div>
      </section>
      <SplitCTA />
    </>
  )
}

function EnquiryForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [f, setF] = useState({ name: '', email: '', message: '', website: '' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF(p => ({ ...p, [k]: e.target.value }))
  const send = async (e: FormEvent) => {
    e.preventDefault(); setState('sending')
    const r = await submitEnquiry(f)
    setState(r.ok ? 'sent' : 'error')
    if (r.ok) setF({ name: '', email: '', message: '', website: '' })
  }
  if (state === 'sent') return (
    <div role="status" className="card mt-6 text-center">
      <h2 className="!text-head">Message sent</h2>
      <p className="mt-2">Thank you. We will get back to you soon. For anything urgent, please call <a className="font-bold underline" href={SITE.phoneHref}>{SITE.phone}</a>.</p>
      <button className="btn-outline mt-6" onClick={() => setState('idle')}>Send another message</button>
    </div>
  )
  return (
    <form className="card mt-6 space-y-4" onSubmit={send}>
      <h2 className="!text-title">General enquiry</h2>
      <p className="text-small">For urgent booking changes or allergy orders, please call us instead.</p>
      <div><label className="label" htmlFor="cn">Name</label><input id="cn" required maxLength={100} autoComplete="name" className="field" value={f.name} onChange={set('name')} /></div>
      <div><label className="label" htmlFor="ce">Email</label><input id="ce" type="email" required maxLength={200} autoComplete="email" className="field" value={f.email} onChange={set('email')} /></div>
      <div><label className="label" htmlFor="cm">Message</label><textarea id="cm" rows={4} required maxLength={2000} className="field" value={f.message} onChange={set('message')} /></div>
      <div aria-hidden="true" className="absolute -left-[9999px]"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label></div>
      {state === 'error' && <p role="alert" className="err">We could not send that just now. Please call <a className="underline" href={SITE.phoneHref}>{SITE.phone}</a> or try again.</p>}
      <button className="btn-primary" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send Message'}</button>
    </form>
  )
}

export function Contact() {
  useSEO('Find Us', 'The Indian Table, 350 Higher Walton Road, Preston, PR5 4HU. Opening hours, directions, telephone and booking.')
  const open = openStatus()
  const [sent, setSent] = useState(false)
  return (
    <>
      <PageHero bg="interior" eyebrow="Contact" title="Find your table">
        <a href={SITE.MAP_URL} target="_blank" rel="noopener" className="btn-gold" onClick={() => track('directions_click')}>Get Directions</a>
        <a href={SITE.phoneHref} className="btn-outline-light" onClick={() => track('phone_click')}>Call Us</a>
        <BookBtn label="Book a Table" light from="contact" />
      </PageHero>
      <section className="section">
        <div className="wrap grid gap-8 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <div className="card">
              <p className="font-bold"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${open ? 'bg-success' : 'bg-gold'}`} />{open ? 'Open now' : 'Currently closed'}</p>
              <p className="mt-4">{SITE.address}</p>
              <p className="mt-2"><a href={SITE.phoneHref} className="font-bold underline">{SITE.phone}</a></p>
              <ul className="mt-4 space-y-2 text-small">{SITE.hours.map(h => <li key={h.days}><strong>{h.days}:</strong> {h.open} to {h.close}</li>)}</ul>
            </div>
            <div className="card text-small"><p>Dining and takeaway are both available. <a href={SITE.ORDER_URL} className="font-bold underline">Order Takeaway</a></p><div className="mt-4"><Placeholder label="ACCESS AND PARKING: CONFIRM BEFORE LAUNCH" /></div></div>
          </Reveal>
          <Reveal delay={0.1}>
            <iframe title="Map of The Indian Table" loading="lazy" className="h-80 w-full rounded-card border border-line" src="https://www.google.com/maps?q=350+Higher+Walton+Road+Preston+PR5+4HU&output=embed" />
            <EnquiryForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}

export function Allergens() {
  useSEO('Allergen and Dietary Information', 'Please tell our team about any allergy, intolerance or dietary requirement before ordering at The Indian Table.')
  const list = ['Celery', 'Cereals containing gluten', 'Crustaceans', 'Eggs', 'Fish', 'Lupin', 'Milk', 'Molluscs', 'Mustard', 'Nuts', 'Peanuts', 'Sesame', 'Soybeans', 'Sulphur dioxide and sulphites']
  return (
    <>
      <PageHero eyebrow="Allergens" title="Allergen and dietary information" copy="Please tell our team about any allergy, intolerance or dietary requirement before ordering.">
        <a href="#matrix" className="btn-gold">View Allergen Information</a>
        <a href={SITE.phoneHref} className="btn-outline-light">Call the Restaurant</a>
      </PageHero>
      <section className="section">
        <div className="wrap space-y-10">
          <div id="matrix"><h2 className="!text-head">Allergen matrix</h2><div className="mt-4"><Placeholder label="ACCESSIBLE ALLERGEN MATRIX: to be added from the approved menu data." /></div></div>
          <div><h2 className="!text-head">The 14 regulated allergens</h2><ul className="dash mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{list.map(a => <li key={a}>{a}</li>)}</ul></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card"><h3>Dining in and by phone</h3><p className="mt-2 text-small">Tell your server or the team on the phone about any requirement before you order.</p></div>
            <div className="card"><h3>Online orders</h3><p className="mt-2 text-small">Allergen information is available before you pay and again at delivery or collection.</p></div>
          </div>
          <Placeholder label="APPROVED CROSS-CONTAMINATION STATEMENT AND LAST-REVIEWED DATE TO BE ADDED." />
        </div>
      </section>
    </>
  )
}

const Prose = ({ title, children }: { title: string; children: ReactNode }) => (
  <>
    <PageHero title={title} />
    <section className="section"><div className="wrap max-w-3xl space-y-4">{children}</div></section>
  </>
)
export function Privacy() {
  useSEO('Privacy Notice', 'How The Indian Table uses your personal information.')
  return <Prose title="Privacy notice">
    <Placeholder label="DRAFT: legal review required before launch." />
    <p>When you book a table we collect your name, mobile number, email address, party size, date and time, and any allergy or occasion notes you give us. We use them only to manage your booking and contact you about it.</p>
    <p>Bookings are stored securely and are emailed to the restaurant. We only send marketing emails if you tick the optional consent box, and you can withdraw consent at any time by contacting us.</p>
    <p>Questions? Call <a className="font-bold underline" href={SITE.phoneHref}>{SITE.phone}</a>.</p>
  </Prose>
}
export function Cookies() {
  useSEO('Cookie Preferences', 'Manage your cookie preferences for The Indian Table.')
  return <Prose title="Cookies">
    <p>We use strictly necessary storage to remember your cookie choice. Analytics and marketing cookies stay off until you accept them, and you can change your mind at any time.</p>
    <button className="btn-primary" onClick={openCookiePrefs}>Cookie Preferences</button>
  </Prose>
}
export function Terms() {
  useSEO('Terms', 'Terms for online orders and bookings at The Indian Table.')
  return <Prose title="Terms for bookings and orders">
    <Placeholder label="DRAFT: legal review required before launch." />
    <p>Table requests are confirmed by the restaurant. Please call us on <a className="font-bold underline" href={SITE.phoneHref}>{SITE.phone}</a> to change or cancel a booking.</p>
    <p>Online takeaway orders are fulfilled through our ordering provider and are subject to its terms.</p>
  </Prose>
}
export function NotFound() {
  useSEO('Page not found', 'This page could not be found.')
  return (
    <section className="section"><div className="wrap text-center">
      <p className="eyebrow">404</p><h1 className="mt-4">This table is empty</h1>
      <p className="mt-4">We could not find that page. Let's get you somewhere useful.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4"><BookBtn from="404" /><OrderBtn from="404" /></div>
    </div></section>
  )
}
