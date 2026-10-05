// Supabase Edge Function: stores a booking and emails the owner via Resend.
// Secrets: RESEND_API_KEY, OWNER_EMAIL, FROM_EMAIL (optional). SUPABASE_URL / SERVICE_ROLE are injected automatically.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405)

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return json({ ok: false, error: 'Invalid request' }, 400) }

  if (b.website) return json({ ok: true }) // honeypot: pretend success to bots

  const name = str(b.name, 100), phone = str(b.phone, 30), email = str(b.email, 200)
  const date = str(b.date, 10), time = str(b.time, 10)
  const party = Number(b.party_size), highchairs = Number(b.highchairs || 0)
  const occasion = str(b.occasion, 60), notes = str(b.notes, 800)
  const marketing = b.marketing_consent === true

  if (!name || phone.replace(/\D/g, '').length < 10 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)
    || !(party >= 1 && party <= 30) || !(highchairs >= 0 && highchairs <= 6)) {
    return json({ ok: false, error: 'Please check your details and try again.' }, 400)
  }

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: row, error } = await db.from('bookings').insert({
    name, phone, email, party_size: party, booking_date: date, booking_time: time,
    highchairs, occasion: occasion || null, notes: notes || null, marketing_consent: marketing,
  }).select('id').single()
  if (error) return json({ ok: false, error: 'Could not save your booking. Please call us on 01772 381 429.' }, 500)

  const key = Deno.env.get('RESEND_API_KEY')
  const owner = Deno.env.get('OWNER_EMAIL')
  const from = Deno.env.get('FROM_EMAIL') || 'The Indian Table <onboarding@resend.dev>'
  let sent = false
  if (key && owner) {
    const pretty = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const rows: [string, string][] = [
      ['Name', name], ['Phone', phone], ['Email', email], ['Party size', String(party)],
      ['Date', pretty], ['Time', time], ['Highchairs', String(highchairs)],
      ['Occasion', occasion || '-'], ['Allergies / dietary', notes || 'None given'],
      ['Marketing consent', marketing ? 'Yes' : 'No'],
    ]
    const table = rows.map(([k, v]) =>
      `<tr><td style="padding:6px 14px 6px 0;color:#12382E;font-weight:700">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join('')
    const html = `<div style="font-family:Arial,sans-serif;color:#202421"><h2 style="color:#12382E">New table booking</h2>
      <p><strong>${esc(name)}</strong> booked for <strong>${party}</strong> on <strong>${esc(pretty)}</strong> at <strong>${esc(time)}</strong>.</p>
      <table>${table}</table><p style="color:#777;font-size:12px">Booking ref: ${row.id}. Reply to this email to contact the guest.</p></div>`
    const send = (payload: Record<string, unknown>) => fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    try {
      const r = await send({ from, to: [owner], reply_to: email, subject: `New booking: ${name}, ${party} on ${date} at ${time}`, html })
      sent = r.ok
      // Best-effort guest acknowledgement (needs a verified sending domain in Resend).
      await send({
        from, to: [email], reply_to: owner, subject: 'We have received your table request, The Indian Table',
        html: `<div style="font-family:Arial,sans-serif"><h2 style="color:#12382E">Thank you, ${esc(name)}</h2>
          <p>We have your request for <strong>${party}</strong> on <strong>${esc(pretty)}</strong> at <strong>${esc(time)}</strong>. We will confirm shortly.</p>
          <p>350 Higher Walton Road, Preston, PR5 4HU<br/>01772 381 429</p></div>`,
      }).catch(() => null)
    } catch { /* booking is already stored */ }
    if (sent) await db.from('bookings').update({ email_sent: true }).eq('id', row.id)
  }
  return json({ ok: true })
})
