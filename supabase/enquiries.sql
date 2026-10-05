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
