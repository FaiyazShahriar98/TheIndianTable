import { useEffect, useState } from 'react'
import { AnimatePresence, m } from '../lib/motion'
import { getConsent, setConsent } from '../lib/analytics'

const EVT = 'tit-open-cookies'
export const openCookiePrefs = () => window.dispatchEvent(new Event(EVT))

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const [manage, setManage] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const c = getConsent()
    setAnalytics(c.analytics); setMarketing(c.marketing)
    if (!c.decided) setShow(true)
    const open = () => { setShow(true); setManage(true) }
    window.addEventListener(EVT, open)
    return () => window.removeEventListener(EVT, open)
  }, [])

  const save = (a: boolean, mk: boolean) => { setConsent({ analytics: a, marketing: mk, decided: true }); setShow(false); setManage(false) }

  return (
    <AnimatePresence>
      {show && (
        <m.div
          role="dialog" aria-label="Cookie preferences"
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.25 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-card border border-line bg-page p-6 lg:bottom-6"
        >
          <p className="font-bold text-brand">Your cookie choices</p>
          <p className="mt-2 text-small">We only use strictly necessary cookies unless you say otherwise. Analytics and marketing stay off until you accept.</p>
          {manage && (
            <div className="mt-4 space-y-2 text-small">
              <label className="flex items-center gap-4"><input type="checkbox" checked disabled className="h-6 w-6 accent-brand" /> Strictly necessary (always on)</label>
              <label className="flex items-center gap-4"><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="h-6 w-6 accent-brand" /> Analytics</label>
              <label className="flex items-center gap-4"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="h-6 w-6 accent-brand" /> Marketing</label>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="btn-outline" onClick={() => save(false, false)}>Reject All</button>
            <button className="btn-primary" onClick={() => save(true, true)}>Accept All</button>
            {manage
              ? <button className="btn-outline col-span-2" onClick={() => save(analytics, marketing)}>Save Preferences</button>
              : <button className="col-span-2 min-h-12 text-small font-bold text-brand underline underline-offset-4" onClick={() => setManage(true)}>Manage Preferences</button>}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
