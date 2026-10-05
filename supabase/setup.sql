-- The Indian Table: booking backend. Paste into Supabase > SQL Editor > Run (safe to re-run).
-- Flow: website inserts a row (anon, insert-only) -> trigger emails the owner via Resend (pg_net).

create extension if not exists pg_net with schema extensions;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null check (char_length(email) between 5 and 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  party_size int not null check (party_size between 1 and 30),
  booking_date date not null check (booking_date >= current_date - 1),
  booking_time text not null check (booking_time ~ '^\d{2}:\d{2}$'),
  highchairs int not null default 0 check (highchairs between 0 and 6),
  occasion text check (char_length(occasion) <= 60),
  notes text check (char_length(notes) <= 800),
  marketing_consent boolean not null default false,
  status text not null default 'new',
  email_sent boolean not null default false
);
create index if not exists bookings_date_idx on public.bookings (booking_date, booking_time);

-- Public visitors may ONLY insert. They can never read, update or delete bookings.
alter table public.bookings enable row level security;
drop policy if exists "anyone can request a booking" on public.bookings;
create policy "anyone can request a booking" on public.bookings for insert to anon, authenticated with check (status = 'new' and email_sent = false);
revoke all on public.bookings from anon, authenticated;
grant insert on public.bookings to anon, authenticated;

-- Private settings (no policies and no grants: unreachable from the website).
create table if not exists public.app_secrets (key text primary key, value text not null);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

create or replace function public.esc(t text) returns text language sql immutable as $$
  select replace(replace(replace(replace(coalesce(t,''),'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;')
$$;

create or replace function public.notify_booking() returns trigger
language plpgsql security definer set search_path = public, extensions, net as $$
declare
  k text := (select value from app_secrets where key = 'resend_api_key');
  owner text := (select value from app_secrets where key = 'owner_email');
  sender text := coalesce((select value from app_secrets where key = 'from_email'), 'The Indian Table <onboarding@resend.dev>');
  hdr jsonb;
  pretty text := to_char(new.booking_date, 'FMDay, FMDD FMMonth YYYY');
  body text;
begin
  if k is null or owner is null then return new; end if;
  hdr := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json');
  body := '<div style="font-family:Arial,sans-serif;color:#202421"><h2 style="color:#12382E">New table booking</h2>'
    || '<p><b>' || esc(new.name) || '</b> for <b>' || new.party_size || '</b> on <b>' || esc(pretty) || '</b> at <b>' || esc(new.booking_time) || '</b></p>'
    || '<table cellpadding="6">'
    || '<tr><td><b>Phone</b></td><td>' || esc(new.phone) || '</td></tr>'
    || '<tr><td><b>Email</b></td><td>' || esc(new.email) || '</td></tr>'
    || '<tr><td><b>Highchairs</b></td><td>' || new.highchairs || '</td></tr>'
    || '<tr><td><b>Occasion</b></td><td>' || coalesce(nullif(esc(new.occasion), ''), '-') || '</td></tr>'
    || '<tr><td><b>Allergies / dietary</b></td><td>' || coalesce(nullif(esc(new.notes), ''), 'None given') || '</td></tr>'
    || '<tr><td><b>Marketing consent</b></td><td>' || case when new.marketing_consent then 'Yes' else 'No' end || '</td></tr></table>'
    || '<p style="color:#777;font-size:12px">Ref ' || new.id || '. Reply to this email to contact the guest.</p></div>';

  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(owner), 'reply_to', new.email,
      'subject', 'New booking: ' || new.name || ', ' || new.party_size || ' on ' || new.booking_date || ' at ' || new.booking_time, 'html', body),
    headers := hdr);

  -- Guest acknowledgement (only delivers once a sending domain is verified in Resend).
  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(new.email), 'reply_to', owner,
      'subject', 'We have received your table request - The Indian Table',
      'html', '<div style="font-family:Arial,sans-serif"><h2 style="color:#12382E">Thank you, ' || esc(split_part(new.name, ' ', 1)) || '</h2><p>We have your request for <b>'
        || new.party_size || '</b> on <b>' || esc(pretty) || '</b> at <b>' || esc(new.booking_time)
        || '</b>. We will confirm shortly.</p><p>350 Higher Walton Road, Preston, PR5 4HU<br/>01772 381 429</p></div>'),
    headers := hdr);
  return new;
exception when others then
  return new; -- never block a booking because email failed
end $$;

drop trigger if exists booking_notify on public.bookings;
create trigger booking_notify after insert on public.bookings for each row execute function public.notify_booking();

-- ===== EDIT THESE TWO VALUES, THEN RUN =====
insert into public.app_secrets (key, value) values
  ('resend_api_key', 're_PASTE_YOUR_RESEND_KEY'),
  ('owner_email',    'owner@example.com')
on conflict (key) do update set value = excluded.value;
-- Optional once a domain is verified in Resend:
-- insert into public.app_secrets values ('from_email', 'The Indian Table <bookings@yourdomain.co.uk>') on conflict (key) do update set value = excluded.value;
