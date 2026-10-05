import { prisma } from './prisma';
import { hasDatabase, hasStripe, TRIAL_DAYS } from './env';
import { stripe } from './stripe';
import { PLANS } from './plans';

const DAY = 86400000;
const ACTIVE = ['active', 'trialing', 'past_due'];

export function isAdmin(email) {
  if (!hasDatabase) return true; // in demo il pannello è visibile con dati di esempio
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && admins.includes(email.toLowerCase()));
}

function monthlyValue(user) {
  const plan = PLANS[user.plan];
  if (!plan) return 0;
  return user.billingInterval === 'yearly' ? plan.yearly : plan.monthly;
}

const DEMO_METRICS = {
  demo: true,
  mrr: 1975,
  arr: 23700,
  paying: { BASE: 18, PRO: 7, total: 25 },
  inTrial: 11,
  pastDue: 1,
  signups30: 42,
  churned30: 2,
  conversion: 38,
  freeToolToday: 87,
  syncErrors: 0,
  lastSync: new Date().toISOString(),
  monthly: [
    { label: 'mag', mrr: 0 },
    { label: 'giu', mrr: 237 },
    { label: 'lug', mrr: 616 },
    { label: 'ago', mrr: 1043 },
    { label: 'set', mrr: 1529 },
    { label: 'ott', mrr: 1975 },
  ],
  stripe: {
    available: 1412.5,
    pending: 562.3,
    charges: [
      { id: 'd1', amount: 149, email: 'hotel.belvedere@example.it', created: new Date(Date.now() - 3600e3).toISOString() },
      { id: 'd2', amount: 79, email: 'trattoria.ponte@example.it', created: new Date(Date.now() - 26 * 3600e3).toISOString() },
      { id: 'd3', amount: 1428, email: 'studio.russo@example.it', created: new Date(Date.now() - 50 * 3600e3).toISOString() },
    ],
    payouts: [{ id: 'p1', amount: 1840.2, arrival: new Date(Date.now() + 2 * DAY).toISOString(), status: 'in_transit' }],
  },
};

async function stripeMetrics() {
  if (!hasStripe) return null;
  try {
    const [balance, charges, payouts] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({ limit: 10 }),
      stripe.payouts.list({ limit: 5 }),
    ]);
    const eur = (list) => (list.find((b) => b.currency === 'eur')?.amount || 0) / 100;
    return {
      available: eur(balance.available),
      pending: eur(balance.pending),
      charges: charges.data
        .filter((c) => c.paid && !c.refunded)
        .map((c) => ({ id: c.id, amount: c.amount / 100, email: c.billing_details?.email || c.receipt_email, created: new Date(c.created * 1000).toISOString() })),
      payouts: payouts.data.map((p) => ({ id: p.id, amount: p.amount / 100, arrival: new Date(p.arrival_date * 1000).toISOString(), status: p.status })),
    };
  } catch (err) {
    console.error('Stripe metrics failed', err);
    return { error: 'Impossibile leggere i dati da Stripe' };
  }
}

export async function getBusinessMetrics() {
  if (!hasDatabase) return DEMO_METRICS;

  const now = Date.now();
  const since30 = new Date(now - 30 * DAY);
  const [users, freeTool, syncErrors, lastSync] = await Promise.all([
    prisma.user.findMany({
      select: { plan: true, billingInterval: true, subscriptionStatus: true, createdAt: true, canceledAt: true, stripeSubscriptionId: true },
    }),
    prisma.freeToolUsage.findUnique({
      where: { ipHash_day: { ipHash: 'GLOBAL', day: new Date().toISOString().slice(0, 10) } },
    }),
    prisma.business.count({ where: { lastSyncError: { not: null } } }),
    prisma.business.aggregate({ _max: { lastSyncedAt: true } }),
  ]);

  const payingUsers = users.filter((u) => u.plan !== 'FREE' && ACTIVE.includes(u.subscriptionStatus));
  const mrr = payingUsers.reduce((s, u) => s + monthlyValue(u), 0);
  const inTrial = users.filter((u) => u.plan === 'FREE' && u.createdAt.getTime() + TRIAL_DAYS * DAY > now).length;

  // Conversione: tra chi ha finito la prova, quanti hanno mai sottoscritto un abbonamento
  const trialDone = users.filter((u) => u.createdAt.getTime() + TRIAL_DAYS * DAY <= now);
  const converted = trialDone.filter((u) => u.stripeSubscriptionId).length;

  // MRR a fine mese per gli ultimi 6 mesi (stima dai dati attuali: data iscrizione / disdetta)
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    const end = new Date(d.getFullYear(), d.getMonth() - i + 1, 0, 23, 59, 59);
    const value = users
      .filter((u) => u.plan !== 'FREE' || u.canceledAt)
      .filter((u) => u.stripeSubscriptionId && u.createdAt <= end && (!u.canceledAt || u.canceledAt > end))
      .reduce((s, u) => s + monthlyValue(u.plan === 'FREE' ? { ...u, plan: 'BASE' } : u), 0);
    monthly.push({ label: end.toLocaleDateString('it-IT', { month: 'short' }), mrr: value });
  }

  return {
    demo: false,
    mrr,
    arr: mrr * 12,
    paying: {
      BASE: payingUsers.filter((u) => u.plan === 'BASE').length,
      PRO: payingUsers.filter((u) => u.plan === 'PRO').length,
      total: payingUsers.length,
    },
    inTrial,
    pastDue: users.filter((u) => u.subscriptionStatus === 'past_due').length,
    signups30: users.filter((u) => u.createdAt >= since30).length,
    churned30: users.filter((u) => u.canceledAt && u.canceledAt >= since30).length,
    conversion: trialDone.length ? Math.round((converted / trialDone.length) * 100) : 0,
    freeToolToday: freeTool?.count || 0,
    syncErrors,
    lastSync: lastSync._max.lastSyncedAt,
    monthly,
    stripe: await stripeMetrics(),
  };
}
