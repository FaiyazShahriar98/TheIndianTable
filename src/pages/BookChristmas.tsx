import { useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from '../lib/motion'
import { SITE } from '../config'
import { useSEO } from '../lib/seo'
import { track } from '../lib/analytics'
import { submitBooking, type BookingInput } from '../lib/supabase'
import { Snowfall, Ornaments, CHRISTMAS_TIMES, CHRISTMAS_TABLES } from '../components/Christmas'

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Christmas Day only -- rolls to next year once this Christmas has passed.
function christmasISO() {
  const now = new Date()
  const year = now.getFullYear() + (now.getMonth() === 11 && now.getDate() > 25 ? 1 : 0)
  return toISO(new Date(year, 11, 25))
}
const CHRISTMAS_DATE = christmasISO()
const CHRISTMAS_DATE_LABEL = new Date(`${CHRISTMAS_DATE}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

type TableId = typeof CHRISTMAS_TABLES[number]['id']
type CartItem = { table: TableId; people: number }

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'time' | 'cart' | 'acknowledgeDeposit', string>>
const blank = {
  date: CHRISTMAS_DATE, time: '', name: '', phone: '', email: '', notes: '', website: '',
  acknowledgeDeposit: false,
  // All three tables always shown, each starting at 0 -- guests add/remove per table rather than picking one.
  cart: CHRISTMAS_TABLES.map((t): CartItem => ({ table: t.id, people: 0 })),
}

export default function BookChristmas() {
  useSEO('Book for Christmas', `Book your table for Christmas Day (${CHRISTMAS_DATE_LABEL}) at The Indian Table in Higher Walton, Preston. Add the Christmas Table, Indian Table and Little Table, each with their own number of guests.`)
  const [f, setF] = useState(blank)
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<'form' | 'review' | 'sending' | 'done'>('form')
  const [serverErr, setServerErr] = useState('')
  const [demo, setDemo] = useState(false)
  const started = useRef(false)

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    if (!started.current) { started.current = true; track('book_start', { from: 'christmas-form' }) }
    setF(p => ({ ...p, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  // Reads the previous count from inside the state updater (not from a render closure), so rapid
  // clicks each apply on top of the one before instead of all computing from the same stale value.
  const bumpRow = (table: TableId, delta: number) => {
    setF(p => ({ ...p, cart: p.cart.map(c => c.table === table ? { ...c, people: Math.max(0, c.people + delta) } : c) }))
    setErrors(e => ({ ...e, cart: undefined }))
  }

  // Only tables with at least one guest actually count toward the booking.
  const validCart = f.cart.filter(c => c.people > 0)
  const totalGuests = validCart.reduce((s, c) => s + c.people, 0)
  const tableName = (id: TableId) => CHRISTMAS_TABLES.find(t => t.id === id)!.label

  const validate = (): boolean => {
    const e: Errors = {}
    if (!f.name.trim()) e.name = 'Please enter your name.'
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Please enter a valid mobile number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Please enter a valid email address.'
    if (!f.time) e.time = 'Please choose a time.'
    if (!validCart.length) e.cart = "Please add at least one guest -- you can't book with 0 guests."
    if (!f.acknowledgeDeposit) e.acknowledgeDeposit = 'Please acknowledge the deposit to continue.'
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
    const table_selections = validCart.map(c => `${tableName(c.table)} × ${c.people}`).join(', ')
    const input: BookingInput = {
      name: f.name, phone: f.phone, email: f.email, party_size: totalGuests, date: f.date, time: f.time,
      highchairs: 0, occasion: 'Christmas', notes: f.notes, marketing_consent: false,
      table: validCart[0]?.table ?? '', table_selections, children: 0, website: f.website,
    }
    const res = await submitBooking(input)
    if (res.ok) { setDemo(!!res.demo); setStep('done'); track('book_complete', { party: totalGuests, tables: validCart.length, occasion: 'christmas' }); window.scrollTo({ top: 0 }) }
    else { setServerErr(res.error || 'Something went wrong.'); setStep('review') }
  }

  const timeLabel = CHRISTMAS_TIMES.find(t => t.value === f.time)?.label ?? ''
  const err = (k: keyof Errors) => errors[k] && <p id={`${k}-e`} className="err" role="alert">{errors[k]}</p>
  const aria = (k: keyof Errors) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-e` : undefined })
  const stepNo = step === 'form' ? 1 : step === 'done' ? 3 : 2

  return (
    <div className="xmas">
      <section className="on-dark grain relative isolate overflow-hidden">
        <Snowfall />
        <div className="wrap relative py-10 md:py-14">
          <Ornaments className="max-w-[160px] md:max-w-[200px]" />
          <p className="eyebrow mb-4 mt-2 text-center">'Tis the season</p>
          <h1 className="!text-big text-center md:!text-price">Book Your Table for Christmas</h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-page/85">{CHRISTMAS_DATE_LABEL}. Choose your tables and your time, and leave the rest to us.</p>
          <ol className="mx-auto mt-6 flex max-w-md gap-2 text-micro font-bold uppercase tracking-wider" aria-label="Progress">
            {['Details', 'Review', 'Confirmed'].map((s, i) => (
              <li key={s} className="flex-1 border-t-2 pt-2 text-center" style={{ borderColor: i < stepNo ? 'rgb(var(--xgold))' : 'rgb(255 255 255 / 0.25)', color: i < stepNo ? 'rgb(var(--xgold))' : 'rgb(255 255 255 / 0.5)' }}>{i + 1}. {s}</li>
            ))}
          </ol>
          <p className="mx-auto mt-6 max-w-md rounded-btn border p-3 text-center text-small" style={{ borderColor: 'rgb(var(--xgold) / 0.35)', background: 'rgb(255 255 255 / 0.06)' }}>
            Not a Christmas booking? <a href={SITE.BOOKING_URL} className="font-bold underline" onClick={() => track('book_start', { from: 'christmas-escape-hatch' })}>Book a regular table instead</a>
          </p>
        </div>
      </section>

      <section className="on-dark relative isolate overflow-hidden py-10 md:py-14">
        <Snowfall count={14} />
        <div className="wrap relative grid gap-10 lg:grid-cols-[1fr_340px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'form' && (
              <m.form key="form" onSubmit={onReview} noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="card space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="name">Name</label>
                    <input id="name" autoComplete="name" className="field" value={f.name} onChange={e => set('name', e.target.value)} {...aria('name')} />
                    {err('name')}
                  </div>
                  <div>
                    <label className="label" htmlFor="phone">Mobile</label>
                    <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" value={f.phone} onChange={e => set('phone', e.target.value)} {...aria('phone')} />
                    {err('phone')}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="email" className="field" value={f.email} onChange={e => set('email', e.target.value)} {...aria('email')} />
                    {err('email')}
                  </div>
                </div>

                <div>
                  <p className="label">Date</p>
                  <p className="font-bold text-page">{CHRISTMAS_DATE_LABEL} <span className="font-normal text-page/70">(Christmas Day bookings only)</span></p>
                </div>

                <fieldset>
                  <legend className="label">Time</legend>
                  <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                    {CHRISTMAS_TIMES.map(t => (
                      <label key={t.value} className="xmas-choice text-center font-bold">
                        <input type="radio" name="time" value={t.value} checked={f.time === t.value} onChange={() => set('time', t.value)} {...aria('time')} />
                        {t.label}
                      </label>
                    ))}
                  </div>
                  {err('time')}
                </fieldset>

                <fieldset>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <legend className="label !mb-0">Your tables</legend>
                    <span className="text-small font-bold text-page/80">{totalGuests} {totalGuests === 1 ? 'guest' : 'guests'} total</span>
                  </div>
                  <div className="space-y-3">
                    {f.cart.map(item => {
                      const t = CHRISTMAS_TABLES.find(x => x.id === item.table)!
                      return (
                        <div key={item.table} className="flex flex-wrap items-center gap-3 rounded-btn border p-3" style={{ borderColor: 'rgb(var(--xgold) / 0.4)' }}>
                          <div className="min-w-[160px] flex-1">
                            <span className="block font-bold text-page">{t.label}</span>
                            <span className="block text-small text-page/70">{t.sub}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" aria-label={`Fewer guests on ${t.label}`} onClick={() => bumpRow(item.table, -1)} className="btn-outline !min-h-10 !w-10 !px-0">−</button>
                            <span className="w-6 text-center font-bold text-page">{item.people}</span>
                            <button type="button" aria-label={`More guests on ${t.label}`} onClick={() => bumpRow(item.table, 1)} className="btn-outline !min-h-10 !w-10 !px-0">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {err('cart')}
                </fieldset>

                <div>
                  <label className="label" htmlFor="notes">Notes / Comments <span className="font-normal">(optional)</span></label>
                  <textarea id="notes" rows={3} className="field" value={f.notes} onChange={e => set('notes', e.target.value)} />
                </div>

                {/* Honeypot: hidden from people, tempting to bots */}
                <div aria-hidden="true" className="absolute -left-[9999px]"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={e => set('website', e.target.value)} /></label></div>

                <div className="rounded-btn border p-3" style={{ borderColor: 'rgb(var(--xgold) / 0.4)' }}>
                  <label className="flex items-start gap-3 text-small text-page/90">
                    <input
                      type="checkbox" className="mt-0.5 h-4 w-4 shrink-0"
                      checked={f.acknowledgeDeposit} onChange={e => set('acknowledgeDeposit', e.target.checked)}
                      {...aria('acknowledgeDeposit')}
                    />
                    <span>I acknowledge that a <strong className="text-page">20% deposit</strong> is required to confirm this booking.</span>
                  </label>
                  {err('acknowledgeDeposit')}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" className="btn-primary">Review Your Booking</button>
                  <a href={SITE.phoneHref} className="btn-outline" onClick={() => track('phone_click', { from: 'book-christmas' })}>Call to Book</a>
                </div>
              </m.form>
            )}

            {(step === 'review' || step === 'sending') && (
              <m.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="card">
                <h2 className="!text-head">Check your booking</h2>
                <dl className="mt-6 divide-y" style={{ borderColor: 'rgb(var(--xgold) / 0.25)' }}>
                  {[['Date', CHRISTMAS_DATE_LABEL], ['Time', timeLabel]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-4" style={{ borderColor: 'rgb(var(--xgold) / 0.25)' }}><dt className="font-bold text-page">{k}</dt><dd className="text-right text-page/85">{v}</dd></div>
                  ))}
                  {validCart.map(c => (
                    <div key={c.table} className="flex justify-between gap-6 py-4" style={{ borderColor: 'rgb(var(--xgold) / 0.25)' }}><dt className="font-bold text-page">{tableName(c.table)}</dt><dd className="text-right text-page/85">{c.people} {c.people === 1 ? 'guest' : 'guests'}</dd></div>
                  ))}
                  {[['Guests (total)', `${totalGuests}`], ['Name', f.name], ['Mobile', f.phone], ['Email', f.email]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-4" style={{ borderColor: 'rgb(var(--xgold) / 0.25)' }}><dt className="font-bold text-page">{k}</dt><dd className="text-right text-page/85">{v}</dd></div>
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
                  <circle cx="32" cy="32" r="30" fill="rgb(var(--xred))" /><path d="M19 33l9 9 17-19" fill="none" stroke="rgb(var(--xgold))" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </m.svg>
                <h2 className="mt-6 !text-head">Thank you, {f.name.split(' ')[0]}</h2>
                <p className="mx-auto mt-4 max-w-md text-page/85">
                  We have received your Christmas booking for <strong className="text-page">{totalGuests}</strong> on <strong className="text-page">{CHRISTMAS_DATE_LABEL}</strong> at <strong className="text-page">{timeLabel}</strong>:
                  {' '}{validCart.map(c => `${tableName(c.table)} × ${c.people}`).join(', ')}. The restaurant will confirm with you shortly.
                </p>
                {demo && <p className="mx-auto mt-4 max-w-md rounded-btn border border-dashed p-4 text-small font-semibold" style={{ borderColor: 'rgb(var(--xgold) / 0.6)', color: 'rgb(var(--xgold))' }}>Demo mode: Supabase is not connected yet, so no email was sent.</p>}
                <p className="mt-6 text-small text-page/85">{SITE.address}<br />Need to change something? Call <a className="font-bold underline" href={SITE.phoneHref}>{SITE.phone}</a>.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <a href={SITE.MAP_URL} target="_blank" rel="noopener" className="btn-gold" onClick={() => track('directions_click')}>Get Directions</a>
                  <a href="/menu/fixed-price-menu.pdf" target="_blank" rel="noopener" className="btn-outline">Preview Our Menu</a>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card !p-6">
              <h3 className="!text-lead">Opening hours</h3>
              <ul className="mt-4 space-y-2 text-small text-page/85">{SITE.hours.map(h => <li key={h.days}><strong className="text-page">{h.days}</strong><br />{h.open} to {h.close}</li>)}</ul>
            </div>
            <div className="card !p-6 text-small text-page/85">
              <h3 className="!text-lead">Prefer to call?</h3>
              <p className="mt-2">Large party or a special request? Speak to us directly.</p>
              <a href={SITE.phoneHref} className="mt-2 inline-block font-bold text-page underline">{SITE.phone}</a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
