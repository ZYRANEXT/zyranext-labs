import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe, PaidPlan, STRIPE_PRICE_BY_PLAN } from '@/lib/stripe';

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await req.json().catch(() => ({}));
  if (!['pro', 'creator', 'team'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const paidPlan = plan as PaidPlan;
  const priceId = STRIPE_PRICE_BY_PLAN[paidPlan];
  if (!priceId) {
    return NextResponse.json({ error: `Missing STRIPE_${paidPlan.toUpperCase()}_PRICE_ID` }, { status: 500 });
  }

  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await sb.from('profiles').upsert({
      id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      plan: 'free',
    }, { onConflict: 'id' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan: paidPlan,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan: paidPlan,
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
