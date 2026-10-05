// Consent-gated analytics. Events are only dispatched after the user accepts analytics cookies.
export type ConsentState = { analytics: boolean; marketing: boolean; decided: boolean }
const KEY = 'tit_consent'

export const getConsent = (): ConsentState => {
  try { return JSON.parse(localStorage.getItem(KEY) || '') } catch { return { analytics: false, marketing: false, decided: false } }
}
export const setConsent = (c: ConsentState) => {
  try { localStorage.setItem(KEY, JSON.stringify(c)) } catch { /* storage unavailable */ }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (!getConsent().analytics) return
  const w = window as unknown as { dataLayer?: unknown[] }
  ;(w.dataLayer = w.dataLayer || []).push({ event, ...params })
}
