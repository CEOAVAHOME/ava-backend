import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { planFromPriceId, stripe } from '@/lib/stripe';

// Configura su Stripe: Developers → Webhooks → endpoint `${APP_URL}/api/stripe/webhook`
// Eventi: checkout.session.completed, customer.subscription.created/updated/deleted

async function syncSubscription(subscription) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id;
  const periodEnd = subscription.current_period_end ?? item?.current_period_end;
  const active = ['active', 'trialing', 'past_due'].includes(subscription.status);
  const plan = active ? planFromPriceId(priceId) || subscription.metadata?.plan || 'BASE' : 'FREE';

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  const userId = subscription.metadata?.userId;

  const where = userId ? { id: userId } : { stripeCustomerId: customerId };
  await prisma.user.update({
    where,
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      plan,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

export async function POST(req) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !hasDatabase) {
    return NextResponse.json({ error: 'Stripe non configurato' }, { status: 501 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Firma non valida: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error('Stripe webhook error', event.type, err);
    return NextResponse.json({ error: 'Errore elaborazione webhook' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
