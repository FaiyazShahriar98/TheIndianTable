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

/** Sends the booking to the `send-booking` Edge Function (stores it and emails the owner). */
export async function submitBooking(b: BookingInput): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!supabase) { await new Promise(r => setTimeout(r, 700)); return { ok: true, demo: true } }
  const { data, error } = await supabase.functions.invoke('send-booking', { body: b })
  if (error || !data?.ok) return { ok: false, error: data?.error || error?.message || 'Booking failed' }
  return { ok: true }
}
