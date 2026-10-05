-- Bookings are written only by the send-booking Edge Function (service role).
-- RLS is enabled with no public policies, so the anon key can never read or write the table directly.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null check (char_length(email) between 5 and 200),
  party_size int not null check (party_size between 1 and 30),
  booking_date date not null,
  booking_time text not null,
  highchairs int not null default 0 check (highchairs between 0 and 6),
  occasion text,
  notes text,
  marketing_consent boolean not null default false,
  status text not null default 'new',
  email_sent boolean not null default false
);

alter table public.bookings enable row level security;
create index if not exists bookings_date_idx on public.bookings (booking_date, booking_time);
