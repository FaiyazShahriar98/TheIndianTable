import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m } from '../lib/motion'
import { SITE } from '../config'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
import { submitBooking, type BookingInput } from '../lib/supabase'

const OCCASIONS = ['', 'Birthday', 'Anniversary', 'Family get-together', 'Business meal', 'Other']
const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** 30-minute slots from opening to 1 hour before close for the chosen date. */
function slotsFor(iso: string) {
  if (!iso) return []
  const [o, c] = SITE.hoursByDay[new Date(`${iso}T12:00:00`).getDay()]
  const out: string[] = []
  for (let h = o; h <= c - 1; h += 0.5) out.push(`${pad(Math.floor(h))}:${h % 1 ? '30' : '00'}`)
  return out
}

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'date' | 'time', string>>
const blank = { party_size: 2, date: '', time: '', name: '', phone: '', email: '', highchairs: 0, occasion: '', notes: '', marketing_consent: false, website: '' }

export default function Book() {
  useSEO('Book a Table', 'Book a table at The Indian Table in Higher Walton, Preston. Choose your date, time and party size. No account needed.')
  const [f, setF] = useState(blank)
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<'form' | 'review' | 'sending' | 'done'>('form')
  const [serverErr, setServerErr] = useState('')
  const [demo, setDemo] = useState(false)
  const started = useRef(false)
  const today = useMemo(() => toISO(new Date()), [])
  const maxDate = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 90); return toISO(d) }, [])
  const slots = useMemo(() => slotsFor(f.date), [f.date])

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    if (!started.current) { started.current = true; track('book_start', { from: 'form' }) }
    setF(p => ({ ...p, [k]: v, ...(k === 'date' ? { time: '' } : {}) }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validate = (): boolean => {
    const e: Errors = {}
    if (!f.name.trim()) e.name = 'Please enter your name.'
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Please enter a valid mobile number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Please enter a valid email address.'
    if (!f.date) e.date = 'Please choose a date.'
    else if (f.date < today) e.date = 'Please choose a date from today onwards.'
    if (!f.time) e.time = 'Please choose a time.'
    setErrors(e)
    if (Object.keys(e).length) {
      setTimeout(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(), 0)
      return false
    }
    return true
  }

  const onReview = (ev: FormEvent) => { ev.preventDefault(); if (validate()) { setStep('review'); window.scrollTo({ top: 0, behavior: 'smooth' }) } }

  const confirm = async () => {
    setStep('sending'); setServerErr('')
    const res = await submitBooking(f as BookingInput)
    if (res.ok) { setDemo(!!res.demo); setStep('done'); track('book_complete', { party: f.party_size }); window.scrollTo({ top: 0 }) }
    else { setServerErr(res.error || 'Something went wrong.'); setStep('review') }
  }

  const prettyDate = f.date ? new Date(`${f.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
  const err = (k: keyof Errors) => errors[k] && <p id={`${k}-e`} className="err" role="alert">{errors[k]}</p>
  const aria = (k: keyof Errors) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-e` : undefined })
  const stepNo = step === 'form' ? 1 : step === 'done' ? 3 : 2

  return (
    <>
      <section className="on-dark bg-brand text-page">
        <div className="wrap py-10 md:py-14">
          <p className="eyebrow mb-4">Book a table</p>
          <h1 className="!text-big md:!text-price">Your table is ready</h1>
          <p className="mt-4 max-w-xl text-page/85">Choose your date, time and party size. We will take care of the rest.</p>
          <ol className="mt-6 flex gap-2 text-micro font-bold uppercase tracking-wider" aria-label="Progress">
            {['Details', 'Review', 'Confirmed'].map((s, i) => (
              <li key={s} className={`flex-1 border-t-2 pt-2 ${i < stepNo ? 'border-gold text-gold' : 'border-page/25 text-page/50'}`}>{i + 1}. {s}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section pt-10 md:pt-14">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_340px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'form' && (
              <m.form key="form" onSubmit={onReview} noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="card space-y-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="label" htmlFor="party">Party size</label>
                    <select id="party" className="field" value={f.party_size} onChange={e => set('party_size', +e.target.value)}>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="date">Date</label>
                    <input id="date" type="date" className="field" min={today} max={maxDate} value={f.date} onChange={e => set('date', e.target.value)} {...aria('date')} />
                    {err('date')}
                  </div>
                  <div>
                    <label className="label" htmlFor="time">Time</label>
                    <select id="time" className="field" value={f.time} disabled={!f.date} onChange={e => set('time', e.target.value)} {...aria('time')}>
                      <option value="">{f.date ? 'Choose a time' : 'Pick a date first'}</option>
                      {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {err('time')}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="name">Full name</label>
                    <input id="name" autoComplete="name" className="field" value={f.name} onChange={e => set('name', e.target.value)} {...aria('name')} />
                    {err('name')}
                  </div>
                  <div>
                    <label className="label" htmlFor="phone">Mobile number</label>
                    <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" value={f.phone} onChange={e => set('phone', e.target.value)} {...aria('phone')} />
                    {err('phone')}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="email" className="field" value={f.email} onChange={e => set('email', e.target.value)} {...aria('email')} />
                    {err('email')}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="hc">Highchairs <span className="font-normal">(optional)</span></label>
                    <select id="hc" className="field" value={f.highchairs} onChange={e => set('highchairs', +e.target.value)}>
                      {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="occ">Occasion <span className="font-normal">(optional)</span></label>
                    <select id="occ" className="field" value={f.occasion} onChange={e => set('occasion', e.target.value)}>
                      {OCCASIONS.map(o => <option key={o} value={o}>{o || 'No occasion'}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="notes">Allergies or dietary requirements <span className="font-normal">(optional)</span></label>
                  <textarea id="notes" rows={3} maxLength={800} className="field" value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Tell us anything our team should know." />
                </div>

                {/* Honeypot: hidden from people, tempting to bots */}
                <div aria-hidden="true" className="absolute -left-[9999px]"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={e => set('website', e.target.value)} /></label></div>

                <label className="flex items-start gap-4 text-small">
                  <input type="checkbox" className="mt-2 h-6 w-6 accent-brand" checked={f.marketing_consent} onChange={e => set('marketing_consent', e.target.checked)} />
                  <span>Optional: email me news and offers from The Indian Table. You can unsubscribe at any time.</span>
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" className="btn-primary">Review Your Booking</button>
                  <a href={SITE.phoneHref} className="btn-outline" onClick={() => track('phone_click', { from: 'book' })}>Call to Book</a>
                </div>
              </m.form>
            )}

            {(step === 'review' || step === 'sending') && (
              <m.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="card">
                <h2 className="!text-head">Check your booking</h2>
                <dl className="mt-6 divide-y divide-line">
                  {([['Guests', `${f.party_size}`], ['Date', prettyDate], ['Time', f.time], ['Name', f.name], ['Mobile', f.phone], ['Email', f.email], ['Highchairs', `${f.highchairs}`], ['Occasion', f.occasion || '-'], ['Allergies / dietary', f.notes || 'None given']] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-4"><dt className="font-bold text-brand">{k}</dt><dd className="text-right">{v}</dd></div>
                  ))}
                </dl>
                {serverErr && (
                  <div role="alert" className="mt-6 rounded-btn border border-danger bg-danger/10 p-4 text-small font-semibold text-danger">
                    {serverErr} <a href={SITE.phoneHref} className="underline">Call {SITE.phone}</a> to book by phone.
                  </div>
                )}
                <div className="mt-8 flex flex-wrap gap-4">
                  <button className="btn-primary" onClick={confirm} disabled={step === 'sending'}>{step === 'sending' ? 'Sending…' : 'Confirm My Table'}</button>
                  <button className="btn-outline" onClick={() => setStep('form')} disabled={step === 'sending'}>Edit Details</button>
                </div>
              </m.div>
            )}

            {step === 'done' && (
              <m.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="card text-center">
                <m.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }} width="64" height="64" viewBox="0 0 64 64" className="mx-auto" aria-hidden="true">
                  <circle cx="32" cy="32" r="30" className="fill-brand" /><path d="M19 33l9 9 17-19" fill="none" className="stroke-gold" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </m.svg>
                <h2 className="mt-6 !text-head">Thank you, {f.name.split(' ')[0]}</h2>
                <p className="mx-auto mt-4 max-w-md">We have received your request for <strong>{f.party_size}</strong> on <strong>{prettyDate}</strong> at <strong>{f.time}</strong>. The restaurant will confirm with you shortly.</p>
                {demo && <p className="mx-auto mt-4 max-w-md rounded-btn border border-dashed border-gold-text/60 p-4 text-small font-semibold text-gold-text">Demo mode: Supabase is not connected yet, so no email was sent.</p>}
                <p className="mt-6 text-small">{SITE.address}<br />Need to change something? Call <a className="font-bold underline" href={SITE.phoneHref}>{SITE.phone}</a>.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <a href={SITE.MAP_URL} target="_blank" rel="noopener" className="btn-primary" onClick={() => track('directions_click')}>Get Directions</a>
                  <Link to="/fixed-price-menu" className="btn-outline">Preview the Menu</Link>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card !p-6">
              <h3 className="!text-lead">Opening hours</h3>
              <ul className="mt-4 space-y-2 text-small">{SITE.hours.map(h => <li key={h.days}><strong>{h.days}</strong><br />{h.open} to {h.close}</li>)}</ul>
            </div>
            <div className="card !p-6 text-small">
              <h3 className="!text-lead">Prefer to call?</h3>
              <p className="mt-2">Large party or urgent change? Speak to us directly.</p>
              <a href={SITE.phoneHref} className="mt-2 inline-block font-bold text-brand underline">{SITE.phone}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
