# Stripe automatic upgrade checklist

## 1. Create products in Stripe

Product names:
- ZYRANEXT Labs Pro
- ZYRANEXT Labs Creator
- ZYRANEXT Labs Team

Monthly recurring prices:
- Pro: $19/month
- Creator: $49/month
- Team: $149/month

Copy each Price ID. It starts with `price_`.

## 2. Add environment variables

```env
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_CREATOR_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
```

## 3. Create webhook

Stripe Dashboard → Developers → Webhooks → Add endpoint

Endpoint URL:

```txt
https://your-domain.com/api/stripe/webhook
```

Events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed

## 4. Test flow

1. Log in to ZYRANEXT Labs
2. Open Pricing
3. Click Pro / Creator / Team
4. Pay with Stripe test card
5. Return to dashboard
6. Confirm `profiles.plan` changed in Supabase

Test card:

```txt
4242 4242 4242 4242
```

Any future expiry date and CVC is OK in Stripe test mode.

## 5. Why not direct Payment Links?

Direct Payment Links are simple, but automatic plan activation is harder unless you configure metadata and user mapping. This v3 uses server-created Checkout Sessions because they attach the logged-in Supabase user ID to Stripe metadata, making automatic upgrades reliable.
