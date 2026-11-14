import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { track } from '../lib/analytics'
import { XMAS } from '../data/christmas'
import { SnowCap, WreathPlate } from './Christmas'

// Pages where a promo popup would be out of place: the Christmas page itself, and the legal pages.
const QUIET = ['/christmas', '/privacy', '/terms', '/cookies', '/allergens']
const SHOW_AFTER_MS = 1200
const REMIND_AFTER_DAYS = 3
const DISMISSED = 'tit_xmas_popup_dismissed'
const SEEN_THIS_SESSION = 'tit_xmas_popup_seen'

const read = (store: Storage | undefined, k: string) => { try { return store?.getItem(k) ?? null } catch { return null } }
const write = (store: Storage | undefined, k: string, v: string) => { try { store?.setItem(k, v) } catch { /* storage unavailable */ } }

// Only run through Christmas Day itself, so a stale popup never greets people in January.
const inSeason = () => new Date() < new Date(XMAS.year, 11, 26)

function alreadyHandled() {
  if (read(window.sessionStorage, SEEN_THIS_SESSION)) return true
  const t = Number(read(window.localStorage, DISMISSED))
  return t > 0 && Date.now() - t < REMIND_AFTER_DAYS * 86_400_000
}

/**
 * Christmas promo popup: appears once shortly after a visitor lands, "Find out more" takes them to /christmas.
 * Once per session, and once dismissed it stays away for a few days. Accessible dialog: Esc and the overlay close it,
 * focus is moved in and trapped, background scroll is locked, and focus returns where it was.
 */
export default function ChristmasPopup() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (QUIET.includes(pathname) || !inSeason() || alreadyHandled()) return
    const t = window.setTimeout(() => {
      if (alreadyHandled()) return
      write(window.sessionStorage, SEEN_THIS_SESSION, '1')
      returnTo.current = document.activeElement as HTMLElement | null
      setOpen(true)
      track('christmas_popup_view')
    }, SHOW_AFTER_MS)
    return () => window.clearTimeout(t)
  }, [pathname])

  const close = useCallback((how: 'x' | 'esc' | 'overlay' | 'cta') => {
    write(window.localStorage, DISMISSED, String(Date.now()))
    setOpen(false)
    track(how === 'cta' ? 'christmas_popup_click' : 'christmas_popup_dismiss', { how })
  }, [])

  // While open: lock page scroll and put focus inside; undo both on close.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    card.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => {
      document.body.style.overflow = prev
      returnTo.current?.focus?.()
    }
  }, [open])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); close('esc'); return }
    if (e.key !== 'Tab' || !card.current) return
    const items = [...card.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
    if (!items.length) return
    const first = items[0], last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-[2px]"
      onMouseDown={e => { if (e.target === e.currentTarget) close('overlay') }}
    >
      <div
        ref={card} role="dialog" aria-modal="true" aria-labelledby="xmas-popup-title" onKeyDown={onKeyDown}
        className="xmas xmas-red xmas-pop relative my-auto w-full max-w-sm rounded-[22px] border-2 px-6 pb-7 pt-5 text-center shadow-2xl"
        style={{ borderColor: '#D6AF5C' }}
      >
        <button
          type="button" onClick={() => close('x')} aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-[#D6AF5C]/70 bg-black/20 text-3xl leading-none text-[#F3D68F] transition-colors hover:bg-black/40"
        >×</button>

        <img src="/xmas/garland.png" alt="" aria-hidden="true" width={386} height={93} className="pointer-events-none mx-auto w-52" />
        <p className="eyebrow mt-3">Celebrate</p>
        <h2 id="xmas-popup-title" className="mt-1 !text-head">Christmas Day at The Indian Table</h2>
        <p className="mt-1 text-small font-bold tracking-[0.12em]" style={{ color: 'rgb(var(--xgold))' }}>{XMAS.times[0]} | {XMAS.times[1]}</p>

        <div className="mx-auto mt-2 w-44 sm:w-48"><WreathPlate className="!max-w-none" /></div>

        <p className="mt-2 text-small text-page/90">Traditional turkey roast or Indian favourites, for the whole family.</p>
        <p className="mt-1 text-small font-bold text-page">Adults {XMAS.adult} <span style={{ color: 'rgb(var(--xgold))' }}>•</span> Children {XMAS.childAges} {XMAS.child}</p>
        <p className="text-micro uppercase tracking-wider text-page/70">Ages {XMAS.freeUnder} and under eat free • Advance bookings only</p>

        <span className="relative mt-6 inline-flex">
          <Link to="/christmas" data-autofocus onClick={() => close('cta')} className="btn-primary !px-8 font-display !text-lead">Find out more</Link>
          <SnowCap />
        </span>
      </div>
    </div>
  )
}
