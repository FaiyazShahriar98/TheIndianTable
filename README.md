# The Indian Table

React + TypeScript + Tailwind + Framer Motion (LazyMotion, `m` components) on Vite. Supabase for bookings, Vercel for hosting.

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

Without `.env` the booking form runs in **demo mode** (no email is sent).

## Booking backend (Supabase + Resend)

1. Create a free [Resend](https://resend.com) API key.
2. Open `supabase/setup.sql`, replace the two values at the bottom (Resend key, owner email), paste it into Supabase > SQL Editor and Run.
3. `.env` already holds the project URL and anon key (also add them as Vercel env vars).

The website inserts into `bookings` with the anon key (RLS: insert-only, nothing readable). A trigger emails the owner via Resend. Until a domain is verified in Resend, it only delivers to the email the Resend account was created with, so use that as `owner_email` while testing. View bookings in Supabase > Table Editor.

## Deploy

Push to GitHub, import the repo in Vercel (framework preset: Vite). `vercel.json` handles SPA routing.

## Before launch

Replace placeholders: logo/icon (`Logo` in `src/components/Layout.tsx`), Unsplash photos (`PHOTOS` in `src/config.ts`), `ORDER_URL` / `INSTAGRAM_URL` in `src/config.ts`, approved menu data (`src/data/menu.ts`), reviews, allergen matrix, legal copy.

## Design guardrails

`npm run lint:grid` fails on off-grid spacing (8pt scale), raw hex or non-token colours, and type outside the 9-step scale. Colour roles and the scale live in `tailwind.config.js`; primitives in `src/index.css`.
