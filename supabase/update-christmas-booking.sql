-- Christmas booking: widen table_pref to the three Christmas options, allow a 0 party size, add a
-- table_selections column for the multi-table "cart" (e.g. "Christmas Table x4, Little Table x2"),
-- surface all of this in the owner email, and give BOTH the owner notification and the guest
-- acknowledgement a Christmas-themed look (deep red + gold, garland header, snowy gift footer, matching
-- the website's /christmas page) whenever the booking's occasion is 'Christmas' -- regular bookings keep the
-- normal brand-green template, unchanged.
--
-- The two small images (public/email/xmas-header.jpg and xmas-footer.jpg, ~10 KB each, cut from the client's
-- Christmas asset sheet) are referenced by their live production URL, since email clients fetch images from
-- the recipient's device, not from this repo. They only show up once pushed and deployed. Some clients
-- (Outlook, Gmail by default) block external images until the recipient clicks "show images" -- every
-- detail in the email is real text on solid colours, so it still reads fine with images blocked.
--
-- Paste into Supabase > SQL Editor > Run (safe to re-run). Requires update-booking-table.sql to have been run already.

-- Christmas-themed shell: deep red frame with a gold keyline, garland header, light body panel (so the
-- booking details stay readable in dark mode / with images blocked), snowy gift footer, red footer band.
create or replace function public.email_shell_xmas(preheader text, inner_html text) returns text language sql immutable as $f$
  select '<!doctype html><html><body style="margin:0;padding:0;background:#5E0A14">'
  || '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' || preheader || '</div>'
  || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#5E0A14"><tr><td align="center" style="padding:24px 12px">'
  || '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:2px solid #D6AF5C;border-radius:18px;overflow:hidden;background:#FFFBF2">'
  || '<tr><td style="background:#7A0F1E;padding:0;font-size:0;line-height:0;text-align:center"><img src="https://www.theindiantablepreston.co.uk/email/xmas-header.jpg" width="600" height="118" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0" /></td></tr>'
  || '<tr><td style="background:#7A0F1E;padding:2px 32px 26px;text-align:center">'
  || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:26px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#F3D68F">The Indian Table</div>'
  || '<div style="margin-top:10px;color:#D6AF5C;font-size:12px;letter-spacing:4px">&#10052; MERRY CHRISTMAS &#10052;</div></td></tr>'
  || '<tr><td style="background:#D6AF5C;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>'
  || '<tr><td style="padding:34px 32px 14px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#202421;background:#FFFBF2">' || inner_html || '</td></tr>'
  || '<tr><td style="padding:0;font-size:0;line-height:0;background:#FFFBF2"><img src="https://www.theindiantablepreston.co.uk/email/xmas-footer.jpg" width="600" height="150" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0" /></td></tr>'
  || '<tr><td style="background:#7A0F1E;padding:22px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#F6F1E6">'
  || '350 Higher Walton Road, Preston, PR5 4HU &nbsp;&#9670;&nbsp; 01772 381 429<br><span style="color:#F3D68F">Wishing you a very Merry Christmas from all of us.</span></td></tr>'
  || '</table></td></tr></table></body></html>'
$f$;

-- Christmas-themed button: gold primary with dark-red text (like the website's /christmas page), outline variant.
create or replace function public.email_button_xmas(href text, label text, solid boolean) returns text language sql immutable as $f$
  select '<a href="' || href || '" style="display:inline-block;margin:0 8px 8px 0;padding:14px 24px;border-radius:12px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;'
  || case when solid then 'background:#D6AF5C;color:#5E0A14;border:1px solid #D6AF5C' else 'background:#FFFBF2;color:#7A0F1E;border:1px solid #D6AF5C' end || '">' || label || '</a>'
$f$;

alter table public.bookings drop constraint if exists bookings_table_pref_check;
alter table public.bookings add constraint bookings_table_pref_check
  check (table_pref is null or table_pref in ('classic','signature','grand','family','alacarte','christmas','indian','little'));

alter table public.bookings drop constraint if exists bookings_party_size_check;
alter table public.bookings add constraint bookings_party_size_check check (party_size between 0 and 30);

alter table public.bookings add column if not exists table_selections text;
alter table public.bookings drop constraint if exists bookings_table_selections_check;
alter table public.bookings add constraint bookings_table_selections_check check (table_selections is null or char_length(table_selections) <= 300);

create or replace function public.notify_booking() returns trigger
language plpgsql security definer set search_path = public, extensions, net as $$
declare
  k text := (select value from app_secrets where key = 'resend_api_key');
  owner text := (select value from app_secrets where key = 'owner_email');
  sender text := coalesce((select value from app_secrets where key = 'from_email'), 'The Indian Table <onboarding@resend.dev>');
  hdr jsonb;
  xmas boolean := (new.occasion = 'Christmas');
  ac text := (case when xmas then '#7A0F1E' else '#12382E' end);
  pretty text := to_char(new.booking_date, 'FMDay, FMDD FMMonth YYYY');
  tel text := regexp_replace(new.phone, '[^0-9+]', '', 'g');
  summary text := '<div style="background:#F6F1E6;border:1px solid ' || (case when xmas then '#D6AF5C' else '#C7A24A' end) || ';border-radius:14px;padding:20px 22px;margin:18px 0 22px;text-align:center">'
      || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:30px;font-weight:bold;color:' || ac || ';line-height:1.1">'
      || new.party_size || case when new.party_size = 1 then ' guest' else ' guests' end || '</div>'
      || '<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:16px;color:#202421">' || esc(pretty) || ' &nbsp;&#9670;&nbsp; <b style="' || (case when xmas then 'color:#C8102E' else '' end) || '">' || esc(new.booking_time) || '</b></div></div>';
  owner_body text;
  guest_body text;
  owner_html text;
  guest_html text;
begin
  if k is null or owner is null then return new; end if;
  hdr := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json');

  owner_body :=
    '<div style="font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:' || (case when xmas then '#A3142A' else '#8a6d22' end) || '">'
    || (case when xmas then '&#10052; New Christmas booking &#10052;' else 'New table booking' end) || '</div>'
    || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:28px;font-weight:bold;color:' || ac || ';margin-top:6px">' || esc(new.name) || '</div>'
    || summary
    || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
    || email_row('Phone', '<a href="tel:' || tel || '" style="color:' || ac || ';font-weight:bold">' || esc(new.phone) || '</a>')
    || email_row('Email', '<a href="mailto:' || esc(new.email) || '" style="color:' || ac || '">' || esc(new.email) || '</a>')
    || email_row('Highchairs', new.highchairs::text)
    || case when new.table_selections is not null and new.table_selections <> ''
         then email_row('Tables', esc(new.table_selections))
         else email_row('Interested in', case coalesce(new.table_pref, '')
           when 'classic' then 'Classic Table' when 'signature' then 'Signature Table' when 'grand' then 'Grand Table'
           when 'family' then 'Family Table' when 'alacarte' then 'À la carte'
           when 'christmas' then 'Christmas Table' when 'indian' then 'Indian Table (à la carte)' when 'little' then 'Little Table (children''s menu)'
           else 'Not sure yet' end)
       end
    || email_row('Children (11 and under)', new.children::text)
    || email_row('Occasion', coalesce(nullif(esc(new.occasion), ''), '-'))
    || email_row('Allergies / dietary', coalesce(nullif(esc(new.notes), ''), 'None given'), new.notes is not null and new.notes <> '')
    || email_row('Marketing consent', case when new.marketing_consent then 'Yes' else 'No' end)
    || '</table>'
    || '<div style="margin-top:26px">'
    || (case when xmas then email_button_xmas('tel:' || tel, 'Call guest', true) else email_button('tel:' || tel, 'Call guest', true) end)
    || (case when xmas then email_button_xmas('mailto:' || esc(new.email) || '?subject=Your%20table%20at%20The%20Indian%20Table', 'Reply by email', false) else email_button('mailto:' || esc(new.email) || '?subject=Your%20table%20at%20The%20Indian%20Table', 'Reply by email', false) end)
    || '</div>'
    || '<div style="margin-top:18px;font-size:12px;color:#8a8a8a">Booking ref ' || new.id || '</div>';

  owner_html := case when xmas then email_shell_xmas(new.name || ' for ' || new.party_size || ' on ' || pretty || ' at ' || new.booking_time, owner_body)
                      else email_shell(new.name || ' for ' || new.party_size || ' on ' || pretty || ' at ' || new.booking_time, owner_body) end;

  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(owner), 'reply_to', new.email,
      'subject', (case when xmas then '🎄 New Christmas booking: ' else 'New booking: ' end) || new.name || ', ' || new.party_size || ' on ' || to_char(new.booking_date, 'FMDD FMMon') || ' at ' || new.booking_time,
      'html', owner_html),
    headers := hdr);

  guest_body :=
    '<div style="font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:' || (case when xmas then '#A3142A' else '#8a6d22' end) || '">'
    || (case when xmas then '&#10052; Your Christmas booking request &#10052;' else 'Booking request received' end) || '</div>'
    || '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:28px;font-weight:bold;color:' || ac || ';margin-top:6px">Thank you, ' || esc(split_part(new.name, ' ', 1)) || '</div>'
    || '<p style="margin:14px 0 0">' || (case when xmas then 'We have your request for Christmas Day with us -- and we can''t wait to celebrate with you. Our team will confirm it with you shortly.' else 'We have your request for a table with us. Our team will confirm it with you shortly.' end) || '</p>'
    || summary
    || (case when new.table_selections is not null and new.table_selections <> ''
         then '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' || email_row('Your tables', esc(new.table_selections)) || '</table>'
         else '' end)
    || '<p style="margin:0 0 6px">Need to change something, or have an allergy to tell us about? Please call us and we will be happy to help.</p>'
    || '<div style="margin-top:20px">' || (case when xmas then email_button_xmas('tel:+441772381429', 'Call 01772 381 429', true) else email_button('tel:+441772381429', 'Call 01772 381 429', true) end) || '</div>';

  guest_html := case when xmas then email_shell_xmas('We have received your Christmas booking', guest_body)
                      else email_shell('We have received your table request', guest_body) end;

  -- Guest acknowledgement (only delivers once a sending domain is verified in Resend).
  perform net.http_post('https://api.resend.com/emails',
    jsonb_build_object('from', sender, 'to', jsonb_build_array(new.email), 'reply_to', owner,
      'subject', (case when xmas then '🎄 We have received your Christmas booking' else 'We have received your table request' end) || ' | The Indian Table', 'html', guest_html),
    headers := hdr);
  return new;
exception when others then
  return new; -- never block a booking because email failed
end $$;
