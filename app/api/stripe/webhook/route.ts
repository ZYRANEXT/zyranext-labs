import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe, planFromPriceId } from '@/lib/stripe';
import type { Plan } from '@/lib/plans';

export const dynamic = 'force-dynamic';

function isPaidStatus(status?: string | null) {
  return status === 'active' || status === 'trialing';
}

async function updateProfilePlan(args: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  plan: Plan;
  status?: string | null;
  currentPeriodEnd?: number | null;
}) {
  const sb = supabaseAdmin();
  let userId = args.userId || null;

  if (!userId && args.customerId) {
    const { data } = await sb.from('profiles').select('id').eq('stripe_customer_id', args.customerId).maybeSingle();
    userId = data?.id || null;
  }
  if (!userId) return;

  await sb.from('profiles').upsert({
    id: userId,
    plan: args.plan,
    subscription_status: args.status || (args.plan === 'free' ? 'free' : 'active'),
    stripe_customer_id: args.customerId || undefined,
    stripe_subscription_id: args.subscriptionId || undefined,
    current_period_end: args.currentPeriodEnd ? new Date(args.currentPeriodEnd * 1000).toISOString() : undefined,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (args.plan === 'free') {
    await sb.from('overlay_urls')
      .update({ active: false })
      .eq('user_id', userId)
      .lt('expires_at', new Date('2999-01-01').toISOString());
  }
}

async function planFromSubscription(subscriptionId: string, fallback?: string | null): Promise<Plan> {
  if (fallback && ['pro', 'creator', 'team'].includes(fallback)) return fallback as Plan;
  const sub = await getStripe().subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
  const priceId = sub.items.data[0]?.price?.id;
  return planFromPriceId(priceId) || 'free';
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: 'Missing webhook secret' }, { status: 400 });

  let event: Stripe.Event;
  const body = await req.text();
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const plan = (session.metadata?.plan || 'free') as Plan;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        let status = 'active';
        let currentPeriodEnd: number | null = null;
        if (subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          status = sub.status;
          currentPeriodEnd = (sub as any).current_period_end || Math.floor(Date.now() / 1000);
        }
        await updateProfilePlan({
          userId,
          customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
          subscriptionId,
          plan,
          status,
          currentPeriodEnd,
        });
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const plan = isPaidStatus(sub.status) ? await planFromSubscription(sub.id, sub.metadata?.plan) : 'free';
        await updateProfilePlan({
          userId: sub.metadata?.user_id,
          customerId,
          subscriptionId: sub.id,
          plan,
          status: sub.status,
          currentPeriodEnd: (sub as any).current_period_end || Math.floor(Date.now() / 1000),
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        await updateProfilePlan({
          userId: sub.metadata?.user_id,
          customerId,
          subscriptionId: sub.id,
          plan: 'free',
          status: 'canceled',
          currentPeriodEnd: (sub as any).current_period_end || Math.floor(Date.now() / 1000),
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
        await updateProfilePlan({
          customerId,
          plan: 'free',
          status: 'payment_failed',
        });
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook handler error' }, { status: 500 });
  }
}
