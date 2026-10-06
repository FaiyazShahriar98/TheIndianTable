import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from '../lib/motion'
import { useScroll, useSpring } from 'framer-motion'
import { SITE, openStatus } from '../config'
import { track } from '../lib/analytics'
import CookieBanner, { openCookiePrefs } from './CookieBanner'

// Neutral text wordmark. EXACT LOGO ASSET REQUIRED: replace with the supplied logo/icon files (do not redraw).
export const Logo = ({ light = false }: { light?: boolean }) => (
  <Link to="/" aria-label="The Indian Table home" className="flex items-center gap-2">
    <span className={`font-display text-body font-semibold uppercase leading-tight tracking-wide sm:whitespace-nowrap sm:text-lead sm:leading-none ${light ? 'text-page' : 'text-brand'}`}>
      The Indian Table
    </span>
  </Link>
)

const dining = [
  { to: '/fixed-price-menu', label: 'Fixed Price' },
  { to: '/a-la-carte', label: 'À La Carte' },
  { to: '/drinks', label: 'Drinks' },
]
const links = [
  { to: '/', label: 'Home' },
  { to: '/order', label: 'Takeaway' },
  { to: '/family', label: 'Family Dining' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/contact', label: 'Find Us' },
]
const navCls = ({ isActive }: { isActive: boolean }) =>
  `navlink whitespace-nowrap rounded-lg px-4 py-2 text-body font-semibold transition-colors duration-200 hover:text-gold-text ${isActive ? 'text-gold-text' : 'text-brand'}`

function Header() {
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.2 })
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  useEffect(() => {
    if (!open) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page">
      <m.div aria-hidden="true" style={{ scaleX: progress }} className="absolute inset-x-0 bottom-[-1px] h-0.5 origin-left bg-gold" />
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center xl:flex">
          {links.slice(0, 1).map(l => <NavLink key={l.to} to={l.to} className={navCls}>{l.label}</NavLink>)}
          <div className="group relative">
            <button className="whitespace-nowrap rounded-lg px-4 py-2 text-small font-semibold text-brand hover:text-gold-text" aria-haspopup="true">Dining Menus ▾</button>
            <div className="invisible absolute left-0 top-full w-48 translate-y-1 rounded-card border border-line bg-page p-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {dining.map(d => <NavLink key={d.to} to={d.to} className={(s) => `block ${navCls(s)}`}>{d.label}</NavLink>)}
            </div>
          </div>
          {links.slice(1).map(l => <NavLink key={l.to} to={l.to} className={navCls}>{l.label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link to="/book" onClick={() => track('book_start', { from: 'header' })} className="btn-primary whitespace-nowrap">Book a Table</Link>
          <Link to="/order" onClick={() => track('order_start', { from: 'header' })} className="btn-outline whitespace-nowrap">Order Takeaway</Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <Link to="/book" onClick={() => track('book_start', { from: 'header' })} className="btn-primary min-h-12 px-4 !text-small">Book</Link>
          <Link to="/order" onClick={() => track('order_start', { from: 'header' })} className="btn-outline min-h-12 px-4 !text-small">Order</Link>
          <button
            className="grid h-12 w-12 place-items-center rounded-btn border border-line-strong text-brand"
            aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(o => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu" aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-64px)] overflow-y-auto bg-page px-5 pb-24 pt-4 xl:hidden"
          >
            {[...links.slice(0, 1), ...dining, ...links.slice(1)].map(l => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `block border-b border-line py-4 font-display text-title font-semibold ${isActive ? 'text-gold-text' : 'text-brand'}`}>
                {l.label}
              </NavLink>
            ))}
            <a href={SITE.phoneHref} className="btn-outline mt-6 w-full" onClick={() => track('phone_click')}>Call {SITE.phone}</a>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  const open = openStatus()
  return (
    <footer className="on-dark bg-brand pb-28 pt-16 text-page lg:pb-10">
      <div className="wrap grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-page/80">{SITE.address}</p>
          <p className="mt-2"><a href={SITE.phoneHref} className="font-bold underline-offset-4 hover:underline" onClick={() => track('phone_click')}>{SITE.phone}</a></p>
          <p className="mt-2 text-page/80">{SITE.website}</p>
          <p className="mt-4 text-small font-semibold"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${open ? 'bg-success' : 'bg-gold'}`} />{open ? 'Open now' : 'Currently closed'}</p>
        </div>
        <div>
          <h3 className="mb-4 !text-lead !text-gold">Opening hours</h3>
          <ul className="space-y-2 text-page/85">
            {SITE.hours.map(h => <li key={h.days}><span className="block text-small text-page/60">{h.days}</span>{h.open} to {h.close}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 !text-lead !text-gold">Eat with us</h3>
          <ul className="space-y-2">
            {[['/book', 'Book a Table'], ['/order', 'Order Takeaway'], ['/fixed-price-menu', 'Fixed-Price Menu'], ['/a-la-carte', 'À La Carte Menu'], ['/drinks', 'Drinks'], ['/family', 'Family Dining']].map(([to, l]) =>
              <li key={to}><Link className="hover:text-gold" to={to}>{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 !text-lead !text-gold">Information</h3>
          <ul className="space-y-2">
            <li><Link className="hover:text-gold" to="/allergens">Allergens and Dietary Information</Link></li>
            <li><Link className="hover:text-gold" to="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-gold" to="/terms">Terms</Link></li>
            <li><button className="hover:text-gold" onClick={openCookiePrefs}>Cookie Preferences</button></li>
            <li>{SITE.INSTAGRAM_URL ? <a className="hover:text-gold" href={SITE.INSTAGRAM_URL} rel="noopener">Instagram</a> : <span className="text-page/50">Instagram (link to be verified)</span>}</li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-12 border-t border-page/15 pt-6 text-small text-page/60">© {new Date().getFullYear()} The Indian Table. All rights reserved.</div>
    </footer>
  )
}

/** Persistent two-button bar on mobile. Hidden on form and checkout pages so it never covers controls. */
function MobileBar() {
  const { pathname } = useLocation()
  if (['/book', '/order', '/bring-to-car'].includes(pathname)) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-line bg-page p-4 lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <Link to="/book" onClick={() => track('book_start', { from: 'bar' })} className="btn-primary">BOOK</Link>
      <Link to="/order" onClick={() => track('order_start', { from: 'bar' })} className="btn-outline">ORDER</Link>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-gold focus:px-4 focus:py-4 focus:font-bold">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <MobileBar />
      <CookieBanner />
    </>
  )
}
