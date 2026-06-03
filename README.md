# ZYRANEXT Labs v5 Production Upgrade

Render-ready Next.js/Supabase/Stripe/OpenAI SaaS build.

## What is included

- SaaS-style landing page
- Pricing page with `/ month` pricing
- Separate `/signup` and `/login`
- Email + Password auth
- Discord/Google OAuth buttons
- SaaS dashboard with sidebar
- Creator Profile cloud save
- AI Workspace
- Clip AI locked for Free and unlocked for Pro+
- Overlay Studio locked for Free and unlocked for Pro+
- Analytics area for Creator+
- Stripe Checkout API for logged-in users
- Payment Link fallback for non-logged-in users
- Stripe Webhook auto-upgrade support
- Overlay URL expiration support

## Render settings

Build Command:

```bash
npm install && npm run build
```

Start Command:

```bash
npm start
```

## Required environment variables

```env
NEXT_PUBLIC_SITE_URL=https://zyranext-labs.onrender.com

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1Te9DYJHP6f3jAKbNMMk2lYI
NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID=price_1Te9F6JHP6f3jAKb1FhwUoi2
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=price_1Te9FTJHP6f3jAKbQOuiTFFu
```

## Stripe webhook URL

```txt
https://zyranext-labs.onrender.com/api/stripe/webhook
```

Events:

- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed

## Supabase OAuth

To use Discord/Google login, enable OAuth providers in Supabase Auth settings and add:

```txt
https://zyranext-labs.onrender.com/**
```

as an allowed redirect URL.


## AI Generator
This v5.2 build uses Google Gemini with the current `gemini-2.0-flash` model. Add `GEMINI_API_KEY` in Render Environment Variables, then redeploy.
