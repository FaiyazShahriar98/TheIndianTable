# The Indian Table

React + TypeScript + Tailwind + Framer Motion (LazyMotion, `m` components) on Vite. Supabase for bookings, Vercel for hosting.

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

Without `.env` the booking form runs in **demo mode** (no email is sent).

## Booking emails (Supabase)

1. Create a Supabase project. Run `supabase/migrations/0001_bookings.sql` in the SQL editor.
2. Create a free [Resend](https://resend.com) API key.
3. Deploy the function and set secrets:
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_REF
   npx supabase secrets set RESEND_API_KEY=re_xxx OWNER_EMAIL=owner@example.com
   # after verifying a domain in Resend: FROM_EMAIL="The Indian Table <bookings@yourdomain.co.uk>"
   npx supabase functions deploy send-booking --no-verify-jwt
   ```
4. Put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (and in Vercel project env vars).

Notes: the `bookings` table has RLS on with no public policies, so only the function (service role) can write. Resend's default sender can only deliver to the Resend account owner's email until a domain is verified, so use the owner's Resend sign-up email as `OWNER_EMAIL` while testing.

## Deploy

Push to GitHub, import the repo in Vercel (framework preset: Vite). `vercel.json` handles SPA routing.

## Before launch

Replace placeholders: logo/icon (`Logo` in `src/components/Layout.tsx`), Unsplash photos (`PHOTOS` in `src/config.ts`), `ORDER_URL` / `INSTAGRAM_URL` in `src/config.ts`, approved menu data (`src/data/menu.ts`), reviews, allergen matrix, legal copy.
