import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { appUrl, hasDatabase, hasStripe, TRIAL_DAYS } from '@/lib/env';
import { getPriceId, stripe } from '@/lib/stripe';
import { requireAccount } from '@/lib/data';

/** POST { plan: "BASE" | "PRO", interval: "monthly" | "yearly" } → { url } di Stripe Checkout */
export async function POST(req) {
  const { plan, interval = 'monthly' } = await req.json().catch(() => ({}));
  if (!['BASE', 'PRO'].includes(plan) || !['monthly', 'yearly'].includes(interval)) {
    return NextResponse.json({ error: 'Piano non valido' }, { status: 400 });
  }

  const ctx = await requireAccount();
  if (ctx.error) {
    // Utente non loggato: lo mandiamo a registrarsi mantenendo il piano scelto.
    return NextResponse.json({ url: `/register?plan=${plan}&interval=${interval}` });
  }

  const priceId = getPriceId(plan, interval);
  if (!hasStripe || !hasDatabase || !priceId) {
    return NextResponse.json({ url: `/dashboard?checkout=demo&plan=${plan}`, demo: true });
  }

  const { user } = ctx;
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Giorni di prova residui, così chi paga prima della scadenza non perde la prova.
  const trialLeft = Math.ceil(
    (new Date(user.createdAt).getTime() + TRIAL_DAYS * 86400000 - Date.now()) / 86400000,
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    customer_update: { address: 'auto', name: 'auto' },
    locale: 'it',
    metadata: { userId: user.id, plan },
    subscription_data: {
      metadata: { userId: user.id, plan },
      ...(user.plan === 'FREE' && trialLeft > 0 ? { trial_period_days: trialLeft } : {}),
    },
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
