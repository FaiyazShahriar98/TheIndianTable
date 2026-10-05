import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

export type BookingInput = {
  name: string; phone: string; email: string
  party_size: number; date: string; time: string
  highchairs: number; occasion: string; notes: string
  marketing_consent: boolean
  website?: string // honeypot, must stay empty
}

/**
 * Inserts the booking (anon role is insert-only via RLS). A database trigger then emails the owner.
 * See supabase/setup.sql.
 */
export async function submitBooking(b: BookingInput): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (b.website) return { ok: true } // bot: pretend success, store nothing
  if (!supabase) { await new Promise(r => setTimeout(r, 700)); return { ok: true, demo: true } }
  const { error } = await supabase.from('bookings').insert(
    {
      name: b.name.trim(), phone: b.phone.trim(), email: b.email.trim(),
      party_size: b.party_size, booking_date: b.date, booking_time: b.time,
      highchairs: b.highchairs, occasion: b.occasion || null, notes: b.notes.trim() || null,
      marketing_consent: b.marketing_consent,
    },
    { count: undefined },
  )
  if (error) return { ok: false, error: 'We could not save your booking just now.' }
  return { ok: true }
}
