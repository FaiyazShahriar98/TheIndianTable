import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from '../lib/motion'
import { useScroll, useSpring } from 'framer-motion'
import { SITE, openStatus } from '../config'
import { track } from '../lib/analytics'
import CookieBanner, { openCookiePrefs } from './CookieBanner'

// Exact uploaded bowl-and-table icon (public/Justlogo.jpg), not redrawn, paired with a live-set wordmark
// in the brand display face. The wordmark steps down to a smaller size on phones (still next to the
// Order button and menu toggle) rather than disappearing, so first-time mobile visitors still see the
// name -- full icon-only would hide the brand entirely until they scroll. Below 360px there just isn't
// room for any size of it alongside both buttons, so it hides there only.
export const Logo = ({ light = false }: { light?: boolean }) => (
  <Link to="/" aria-label="The Indian Table home" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3">
    <img src="/Justlogo.jpg" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" />
    <span className={`hidden whitespace-nowrap font-display text-small font-semibold uppercase leading-none tracking-wide min-[360px]:inline min-[480px]:text-lead ${light ? 'text-page' : 'text-brand'}`}>
      The Indian Table
    </span>
  </Link>
)

// Real menu PDFs supplied by the client (public/menu) -- link straight to these rather than the
// in-app menu pages, which are still full of "approved items to be added" placeholders.
const menus = [
  { href: '/menu/fixed-price-menu.pdf', label: 'Fixed Price Menu' },
  { href: '/menu/a-la-carte-menu.pdf', label: 'À La Carte Menu' },
  { href: '/menu/takeaway-menu.pdf', label: 'Takeaway Menu' },
]
const navCls = ({ isActive }: { isActive: boolean }) =>
  `navlink whitespace-nowrap rounded-lg px-4 py-2 text-body font-semibold transition-colors duration-200 hover:text-gold-text ${isActive ? 'text-gold-text' : 'text-brand'}`
const plainNavCls = 'navlink whitespace-nowrap rounded-lg px-4 py-2 text-body font-semibold text-brand transition-colors duration-200 hover:text-gold-text'

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
          <NavLink to="/" className={navCls}>Home</NavLink>
          <NavLink to="/our-story" className={navCls}>Our Story</NavLink>
          <div className="group relative">
            <button className="whitespace-nowrap rounded-lg px-4 py-2 text-small font-semibold text-brand hover:text-gold-text" aria-haspopup="true">Menus ▾</button>
            <div className="invisible absolute left-0 top-full w-52 translate-y-1 rounded-card border border-line bg-page p-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {menus.map(m => <a key={m.href} href={m.href} target="_blank" rel="noopener" className={`block ${plainNavCls}`}>{m.label}</a>)}
            </div>
          </div>
          <NavLink to="/contact" className={navCls}>Find Us</NavLink>
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link to="/book" onClick={() => track('book_start', { from: 'header' })} className="btn-primary whitespace-nowrap">Book a Table</Link>
          <a href={SITE.ORDER_URL} onClick={() => track('order_start', { from: 'header' })} className="btn-outline whitespace-nowrap">Order Takeaway</a>
        </div>
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <a href={SITE.ORDER_URL} onClick={() => track('order_start', { from: 'header' })} className="btn-gold min-h-12 px-4">Order</a>
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
            <div className="grid gap-4 pb-4">
              <Link to="/book" onClick={() => track('book_start', { from: 'menu' })} className="btn-primary">Book a Table</Link>
              <a href={SITE.ORDER_URL} onClick={() => track('order_start', { from: 'menu' })} className="btn-outline">Order Takeaway</a>
            </div>
            {[['/', 'Home'], ['/our-story', 'Our Story']].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `block border-b border-line py-4 font-display text-title font-semibold ${isActive ? 'text-gold-text' : 'text-brand'}`}>
                {label}
              </NavLink>
            ))}
            <p className="border-b border-line pb-2 pt-4 text-micro font-bold uppercase tracking-wider text-gold-text">Menus</p>
            {menus.map(m => (
              <a key={m.href} href={m.href} target="_blank" rel="noopener" className="block border-b border-line py-4 font-display text-title font-semibold text-brand">
                {m.label}
              </a>
            ))}
            <NavLink to="/contact" className={({ isActive }) => `block border-b border-line py-4 font-display text-title font-semibold ${isActive ? 'text-gold-text' : 'text-brand'}`}>
              Find Us
            </NavLink>
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
          {/* Full square lockup (icon + wordmark + tagline): the footer's emerald background is the exact
              colour baked into the image, so it sits flush with no visible edge and has room to stay legible. */}
          <Link to="/" aria-label="The Indian Table home">
            <img src="/logo.jpg" alt="" width={160} height={160} className="h-40 w-40" />
          </Link>
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
            <li><Link className="hover:text-gold" to="/book">Book a Table</Link></li>
            <li><a className="hover:text-gold" href={SITE.ORDER_URL}>Order Takeaway</a></li>
            {menus.map(m => <li key={m.href}><a className="hover:text-gold" href={m.href} target="_blank" rel="noopener">{m.label}</a></li>)}
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
  if (pathname === '/book') return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-line bg-page p-4 lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <Link to="/book" onClick={() => track('book_start', { from: 'bar' })} className="btn-primary">BOOK</Link>
      <a href={SITE.ORDER_URL} onClick={() => track('order_start', { from: 'bar' })} className="btn-outline">ORDER</a>
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
