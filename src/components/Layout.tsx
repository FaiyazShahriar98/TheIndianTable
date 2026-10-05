import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from '../lib/motion'
import { SITE, openStatus } from '../config'
import { track } from '../lib/analytics'
import CookieBanner, { openCookiePrefs } from './CookieBanner'

// Placeholder wordmark. Replace with the exact logo and icon assets supplied by the owner.
export const Logo = ({ light = false }: { light?: boolean }) => (
  <Link to="/" aria-label="The Indian Table home" className="flex items-center gap-2.5">
    <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" className={light ? 'text-brass' : 'text-emerald'}>
      <path d="M12 30h40a20 20 0 0 1-40 0z" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <path d="M32 6l3.5 7-3.5 7-3.5-7z" fill="#C7A24A" />
      <path d="M18 54h28" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
    <span className={`font-display text-[22px] font-semibold uppercase leading-none tracking-wide ${light ? 'text-cream' : 'text-emerald'}`}>
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
  `whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors hover:text-brass-600 ${isActive ? 'text-brass-600' : 'text-emerald'}`

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-emerald/15 bg-cream/95 backdrop-blur-sm">
      <div className="wrap flex h-[68px] items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center xl:flex">
          {links.slice(0, 1).map(l => <NavLink key={l.to} to={l.to} className={navCls}>{l.label}</NavLink>)}
          <div className="group relative">
            <button className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold text-emerald hover:text-brass-600" aria-haspopup="true">Dining Menus ▾</button>
            <div className="invisible absolute left-0 top-full w-48 translate-y-1 rounded-card border border-emerald/15 bg-cream p-2 opacity-0 shadow-sm transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {dining.map(d => <NavLink key={d.to} to={d.to} className={(s) => `block ${navCls(s)}`}>{d.label}</NavLink>)}
            </div>
          </div>
          {links.slice(1).map(l => <NavLink key={l.to} to={l.to} className={navCls}>{l.label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link to="/book" onClick={() => track('book_start', { from: 'header' })} className="btn-primary whitespace-nowrap">Book a Table</Link>
          <Link to="/order" onClick={() => track('order_start', { from: 'header' })} className="btn-outline whitespace-nowrap">Order Takeaway</Link>
        </div>
        <div className="flex items-center gap-2 xl:hidden">
          <Link to="/order" className="btn-gold min-h-[44px] px-4">Order</Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-btn border border-emerald/30 text-emerald"
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
            className="absolute inset-x-0 top-full h-[calc(100dvh-68px)] overflow-y-auto bg-cream px-5 pb-24 pt-4 xl:hidden"
          >
            {[...links.slice(0, 1), ...dining, ...links.slice(1)].map(l => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `block border-b border-emerald/10 py-4 font-display text-3xl font-semibold ${isActive ? 'text-brass-600' : 'text-emerald'}`}>
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
    <footer className="on-dark bg-emerald pb-28 pt-16 text-cream lg:pb-10">
      <div className="wrap grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-cream/80">{SITE.address}</p>
          <p className="mt-2"><a href={SITE.phoneHref} className="font-bold underline-offset-4 hover:underline" onClick={() => track('phone_click')}>{SITE.phone}</a></p>
          <p className="mt-1 text-cream/80">{SITE.website}</p>
          <p className="mt-3 text-sm font-semibold"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${open ? 'bg-green-400' : 'bg-brass'}`} />{open ? 'Open now' : 'Currently closed'}</p>
        </div>
        <div>
          <h3 className="mb-3 !text-xl !text-brass">Opening hours</h3>
          <ul className="space-y-1.5 text-cream/85">
            {SITE.hours.map(h => <li key={h.days}><span className="block text-sm text-cream/60">{h.days}</span>{h.open} to {h.close}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 !text-xl !text-brass">Eat with us</h3>
          <ul className="space-y-1.5">
            {[['/book', 'Book a Table'], ['/order', 'Order Takeaway'], ['/fixed-price-menu', 'Fixed-Price Menu'], ['/a-la-carte', 'À La Carte Menu'], ['/drinks', 'Drinks'], ['/family', 'Family Dining']].map(([to, l]) =>
              <li key={to}><Link className="hover:text-brass" to={to}>{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 !text-xl !text-brass">Information</h3>
          <ul className="space-y-1.5">
            <li><Link className="hover:text-brass" to="/allergens">Allergens and Dietary Information</Link></li>
            <li><Link className="hover:text-brass" to="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-brass" to="/terms">Terms</Link></li>
            <li><button className="hover:text-brass" onClick={openCookiePrefs}>Cookie Preferences</button></li>
            <li>{SITE.INSTAGRAM_URL ? <a className="hover:text-brass" href={SITE.INSTAGRAM_URL} rel="noopener">Instagram</a> : <span className="text-cream/50">Instagram (link to be verified)</span>}</li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-12 border-t border-cream/15 pt-6 text-sm text-cream/60">© {new Date().getFullYear()} The Indian Table. All rights reserved.</div>
    </footer>
  )
}

/** Persistent two-button bar on mobile. Hidden on form and checkout pages so it never covers controls. */
function MobileBar() {
  const { pathname } = useLocation()
  if (['/book', '/order', '/bring-to-car'].includes(pathname)) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-emerald/20 bg-cream/95 p-3 backdrop-blur-sm lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-btn focus:bg-brass focus:px-4 focus:py-3 focus:font-bold">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <MobileBar />
      <CookieBanner />
    </>
  )
}
