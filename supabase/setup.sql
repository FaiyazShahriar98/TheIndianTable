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
  email_sent boolean not null default false,
  table_pref text check (table_pref is null or table_pref in ('classic','signature','grand','family','alacarte')),
  children int not null default 0 check (children between 0 and 30)
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

-- >>> EMAIL (branded templates; safe to re-run on its own, contains no secrets)
create or replace function public.esc(t text) returns text language sql immutable as $$
  select replace(replace(replace(replace(coalesce(t,''),'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;')
$$;

create or replace function public.email_shell(preheader text, inner_html text) returns text language sql immutable as $f$
  select '<!doctype html><html><body style="margin:0;padding:0;background:#F6F1E6">'
  || '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' || preheader || '</div>'
  || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1E6"><tr><td align="center" style="padding:24px 12px">'
  || '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #C7A24A;border-radius:18px;overflow:hidden;background:#ffffff">'
  || '<tr><td style="background:#12382E;padding:30px 32px 26px;text-align:center">'
  || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:26px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#F6F1E6">The Indian Table</div>'
  || '<div style="margin-top:10px;color:#C7A24A;font-size:12px;letter-spacing:8px">&#9670; &#9670; &#9670;</div></td></tr>'
  || '<tr><td style="padding:34px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#202421">' || inner_html || '</td></tr>'
  || '<tr><td style="background:#12382E;padding:22px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#F6F1E6">'
  || '350 Higher Walton Road, Preston, PR5 4HU &nbsp;&#9670;&nbsp; 01772 381 429<br><span style="color:#C7A24A">A complete Indian feast. One clear price.</span></td></tr>'
  || '</table></td></tr></table></body></html>'
$f$;

create or replace function public.email_row(label text, val text, hl boolean default false) returns text language sql immutable as $f$
  select '<tr><td style="padding:11px 12px 11px 0;border-bottom:1px solid #ece5d4;width:36%;vertical-align:top;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#8a6d22">' || label
  || '</td><td style="padding:11px 0;border-bottom:1px solid #ece5d4;font-family:Arial,sans-serif;font-size:15px;color:#202421;' || case when hl then 'background:#fbf3dc;padding-left:10px;font-weight:bold' else '' end || '">' || val || '</td></tr>'
$f$;

create or replace function public.email_button(href text, label text, solid boolean) returns text language sql immutable as $f$
  select '<a href="' || href || '" style="display:inline-block;margin:0 8px 8px 0;padding:14px 24px;border-radius:12px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;'
  || case when solid then 'background:#12382E;color:#F6F1E6;border:1px solid #12382E' else 'background:#ffffff;color:#12382E;border:1px solid #12382E' end || '">' || label || '</a>'
$f$;

create or replace function public.notify_booking() returns trigger
language plpgsql security definer set search_path = public, extensions, net as $$
declare
  k text := (select value from app_secrets where key = 'resend_api_key');
  owner text := (select value from app_secrets where key = 'owner_email');
  sender text := coalesce((select value from app_secrets where key = 'from_email'), 'The Indian Table <onboarding@resend.dev>');
  hdr jsonb;
  pretty text := to_char(new.booking_date, 'FMDay, FMDD FMMonth YYYY');
  tel text := regexp_replace(new.phone, '[^0-9+]', '', 'g');
  summary text := '<div style="background:#F6F1E6;border:1px solid #C7A24A;border-radius:14px;padding:20px 22px;margin:18px 0 22px;text-align:center">'
      || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:30px;font-weight:bold;color:#12382E;line-height:1.1">'
      || new.party_size || case when new.party_size = 1 then ' guest' else ' guests' end || '</div>'
      || '<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:16px;color:#202421">' || esc(pretty) || ' &nbsp;&#9670;&nbsp; <b>' || esc(new.booking_time) || '</b></div></div>';
  owner_html text;
  guest_html text;
begin
  if k is null or owner is null then return new; end if;
  hdr := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json');

  owner_html := email_shell(new.name || ' for ' || new.party_size || ' on ' || pretty || ' at ' || new.booking_time,
    '<div style="font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#8a6d22">New table booking</div>'
    || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:28px;font-weight:bold;color:#12382E;margin-top:6px">' || esc(new.name) || '</div>'
    || summary
    || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
    || email_row('Phone', '<a href="tel:' || tel || '" style="color:#12382E;font-weight:bold">' || esc(new.phone) || '</a>')
    || email_row('Email', '<a href="mailto:' || esc(new.email) || '" style="color:#12382E">' || esc(new.email) || '</a>')
    || email_row('Highchairs', new.highchairs::text)
    || email_row('Interested in', case coalesce(new.table_pref, '') when 'classic' then 'Classic Table' when 'signature' then 'Signature Table' when 'grand' then 'Grand Table' when 'family' then 'Family Table' when 'alacarte' then 'À la carte' else 'Not sure yet' end)
    || email_row('Children (11 and under)', new.children::text)
    || email_row('Occasion', coalesce(nullif(esc(new.occasion), ''), '-'))
    || email_row('Allergies / dietary', coalesce(nullif(esc(new.notes), ''), 'None given'), new.notes is not null and new.notes <> '')
    || email_row('Marketing consent', case when new.marketing_consent then 'Yes' else 'No' end)
    || '</table>'
    || '<div style="margin-top:26px">' || email_button('tel:' || tel, 'Call guest', true) || email_button('mailto:' || esc(new.email) || '?subject=Your%20table%20at%20The%20Indian%20Table', 'Reply by email', false) || '</div>'
    || '<div style="margin-top:18px;font-size:12px;color:#8a8a8a">Booking ref ' || new.id || '</div>');

  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(owner), 'reply_to', new.email,
      'subject', 'New booking: ' || new.name || ', ' || new.party_size || ' on ' || to_char(new.booking_date, 'FMDD FMMon') || ' at ' || new.booking_time,
      'html', owner_html),
    headers := hdr);

  guest_html := email_shell('We have received your table request',
    '<div style="font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#8a6d22">Booking request received</div>'
    || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:28px;font-weight:bold;color:#12382E;margin-top:6px">Thank you, ' || esc(split_part(new.name, ' ', 1)) || '</div>'
    || '<p style="margin:14px 0 0">We have your request for a table with us. Our team will confirm it with you shortly.</p>'
    || summary
    || '<p style="margin:0 0 6px">Need to change something, or have an allergy to tell us about? Please call us and we will be happy to help.</p>'
    || '<div style="margin-top:20px">' || email_button('tel:+441772381429', 'Call 01772 381 429', true) || '</div>');

  -- Guest acknowledgement (only delivers once a sending domain is verified in Resend).
  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(new.email), 'reply_to', owner,
      'subject', 'We have received your table request | The Indian Table', 'html', guest_html),
    headers := hdr);
  return new;
exception when others then
  return new; -- never block a booking because email failed
end $$;
-- <<< EMAIL

-- >>> ENQUIRIES (contact form -> table -> branded email to the owner). Safe to re-run. Contains no secrets.
-- Requires the email helper functions from email-template.sql and the app_secrets rows from setup.sql.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 5 and 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(message) between 1 and 2000)
);
alter table public.enquiries enable row level security;
drop policy if exists "anyone can send an enquiry" on public.enquiries;
create policy "anyone can send an enquiry" on public.enquiries for insert to anon, authenticated with check (true);
revoke all on public.enquiries from anon, authenticated;
grant insert on public.enquiries to anon, authenticated;

create or replace function public.notify_enquiry() returns trigger
language plpgsql security definer set search_path = public, extensions, net as $$
declare
  k text := (select value from app_secrets where key = 'resend_api_key');
  owner text := (select value from app_secrets where key = 'owner_email');
  sender text := coalesce((select value from app_secrets where key = 'from_email'), 'The Indian Table <onboarding@resend.dev>');
begin
  if k is null or owner is null then return new; end if;
  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(owner), 'reply_to', new.email,
      'subject', 'New website enquiry from ' || new.name,
      'html', email_shell('New enquiry from ' || new.name,
        '<div style="font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#8a6d22">New website enquiry</div>'
        || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:28px;font-weight:bold;color:#12382E;margin-top:6px">' || esc(new.name) || '</div>'
        || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px">'
        || email_row('Email', '<a href="mailto:' || esc(new.email) || '" style="color:#12382E">' || esc(new.email) || '</a>')
        || email_row('Message', replace(esc(new.message), E'\n', '<br>'))
        || '</table><div style="margin-top:26px">'
        || email_button('mailto:' || esc(new.email) || '?subject=Your%20enquiry%20to%20The%20Indian%20Table', 'Reply by email', true) || '</div>'
        || '<div style="margin-top:18px;font-size:12px;color:#8a8a8a">Enquiry ref ' || new.id || '</div>')),
    headers := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json'));
  return new;
exception when others then
  return new; -- never block an enquiry because email failed
end $$;

drop trigger if exists enquiry_notify on public.enquiries;
create trigger enquiry_notify after insert on public.enquiries for each row execute function public.notify_enquiry();
-- <<< ENQUIRIES

drop trigger if exists booking_notify on public.bookings;
create trigger booking_notify after insert on public.bookings for each row execute function public.notify_booking();

-- ===== EDIT THESE TWO VALUES, THEN RUN =====
insert into public.app_secrets (key, value) values
  ('resend_api_key', 're_PASTE_YOUR_RESEND_KEY'),
  ('owner_email',    'owner@example.com')
on conflict (key) do update set value = excluded.value;
-- Optional once a domain is verified in Resend:
-- insert into public.app_secrets values ('from_email', 'The Indian Table <bookings@yourdomain.co.uk>') on conflict (key) do update set value = excluded.value;
