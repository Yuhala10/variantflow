# VariantFlow

Bilingual (English / French) SaaS for generating Shopify product variants, SKUs and prices, validating catalogs and exporting CSV files (Shopify, WooCommerce, universal).

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand and Supabase (auth + Postgres). Payments use Paymento (USDT TRC20).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000 (English) or http://localhost:3000/fr (French).

Run the test suite (domain logic, importer, exporters, plans and the catalog store) with `npm test`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only: payment webhook and row-run metering |
| `PAYMENTO_SECRET_KEY` | Server only: verifies payment tokens with Paymento |
| `NEXT_PUBLIC_PAYMENTO_PRO_LINK`, `NEXT_PUBLIC_PAYMENTO_SCALE_LINK` | Hosted checkout links |
| `NEXT_PUBLIC_SITE_URL` | Canonical domain (defaults to `https://variantflow-omega.vercel.app`) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Optional Search Console verification |

## Database

Run the migrations in `supabase/migrations/` in order in the Supabase SQL editor:

1. `001_initial.sql` — profiles, projects, subscriptions, usage, payments (with row-level security)
2. `002_owner_access_and_hardening.sql` — owner/admin roles, locked profile emails, one-time payment tokens
3. `003_usage_metering.sql` — atomic monthly row-run metering

### Granting owner access

Owners and admins get every feature with no limits. Roles can only be granted from the SQL editor:

```sql
insert into public.user_roles (user_id, role, note)
select id, 'owner', 'Founder account' from auth.users where email = 'you@example.com'
on conflict (user_id) do update set role = excluded.role;
```

## Plans

Plan limits are defined once in `lib/entitlements.ts` and enforced by the API routes. The browser only displays them.

| | Free | Pro | Scale |
|---|---|---|---|
| Projects | 1 | Unlimited | Unlimited |
| Variants per export | 50 | Unlimited | Unlimited |
| Row-runs / month | — | 2,000 | 15,000 |
| CSV import + header mapping + cleanup | — | ✓ | ✓ |
| Advanced validation | — | ✓ | ✓ |
| Smart (content-based) mapping, normalization | — | — | ✓ |
| WooCommerce + universal exports | — | — | ✓ |

A row-run is one variant row exported or one supplier row imported.

## Languages

English is served without a prefix (`/pricing`), French under `/fr` (`/fr/pricing`). All text lives in `lib/i18n/dictionaries/`; `fr.ts` is type-checked against `en.ts`, so a missing translation fails the build.
