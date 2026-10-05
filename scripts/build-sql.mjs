// Builds supabase/setup.local.sql (gitignored) = setup.sql + secrets from .env.
// Usage: node scripts/build-sql.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => /^[A-Z_]+=/.test(l)).map(l => [l.split('=')[0], l.slice(l.indexOf('=') + 1).trim()]),
)
const q = s => `'${String(s).replace(/'/g, "''")}'`
if (!env.RESEND_API_KEY?.startsWith('re_')) throw new Error('RESEND_API_KEY missing in .env')
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(env.OWNER_EMAIL || '')) throw new Error('Set OWNER_EMAIL in .env first')

const base = readFileSync('supabase/setup.sql', 'utf8').split('-- ===== EDIT THESE')[0]
const rows = [['resend_api_key', env.RESEND_API_KEY], ['owner_email', env.OWNER_EMAIL]]
if (env.FROM_EMAIL) rows.push(['from_email', env.FROM_EMAIL])
const sql = `${base}insert into public.app_secrets (key, value) values\n${rows.map(([k, v]) => `  (${q(k)}, ${q(v)})`).join(',\n')}\non conflict (key) do update set value = excluded.value;\n`
writeFileSync('supabase/setup.local.sql', sql)
console.log('Wrote supabase/setup.local.sql. Paste it into Supabase > SQL Editor > Run. Do not commit it.')
