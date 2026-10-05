const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const backendConnected = Boolean(url && key)

export type BookingInput = {
  name: string; phone: string; email: string
  party_size: number; date: string; time: string
  highchairs: number; occasion: string; notes: string
  marketing_consent: boolean
  website?: string // honeypot, must stay empty
}

/**
 * Inserts the booking through Supabase's REST API (plain fetch: no SDK, keeps the booking page tiny).
 * The anon role is insert-only via RLS; a database trigger then emails the owner. See supabase/setup.sql.
 */
export async function submitBooking(b: BookingInput): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (b.website) return { ok: true } // bot: pretend success, store nothing
  if (!url || !key) { await new Promise(r => setTimeout(r, 700)); return { ok: true, demo: true } }
  try {
    const res = await fetch(`${url}/rest/v1/bookings`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        name: b.name.trim(), phone: b.phone.trim(), email: b.email.trim(),
        party_size: b.party_size, booking_date: b.date, booking_time: b.time,
        highchairs: b.highchairs, occasion: b.occasion || null, notes: b.notes.trim() || null,
        marketing_consent: b.marketing_consent,
      }),
    })
    if (!res.ok) return { ok: false, error: 'We could not save your booking just now.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'We could not reach the booking service.' }
  }
}
