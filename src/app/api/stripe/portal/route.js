import { NextResponse } from 'next/server';
import { appUrl, hasStripe } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { requireAccount } from '@/lib/data';

/** POST → { url } del Customer Portal Stripe (cambio piano, fatture, disdetta). */
export async function POST() {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;

  if (!hasStripe || !ctx.user.stripeCustomerId) {
    return NextResponse.json({ url: '/pricing' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: ctx.user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`,
  });
  return NextResponse.json({ url: session.url });
}
