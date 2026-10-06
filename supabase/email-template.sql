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
