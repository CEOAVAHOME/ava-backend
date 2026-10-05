import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { hasDatabase, TRIAL_DAYS } from './env';
import { getUserId } from './auth';
import { DEMO_BUSINESS, DEMO_REVIEWS, DEMO_USER } from './mock-data';

/** Utente + attività principale. In demo restituisce i dati mock. */
export async function getAccount(userId) {
  if (!userId) return null;
  if (!hasDatabase) return { user: DEMO_USER, business: DEMO_BUSINESS, demo: true };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { businesses: { orderBy: { createdAt: 'asc' }, take: 1 } },
  });
  if (!user) return null;

  let business = user.businesses[0];
  if (!business) {
    business = await prisma.business.create({
      data: { userId, name: user.name ? `Attività di ${user.name}` : 'La mia attività' },
    });
  }
  const { businesses, passwordHash, ...safeUser } = user;
  return { user: safeUser, business, demo: false };
}

export function trialEndsAt(user) {
  if (!user?.createdAt) return null;
  return new Date(new Date(user.createdAt).getTime() + TRIAL_DAYS * 86400000);
}

/** true se l'utente ha un abbonamento attivo o è ancora nel periodo di prova. */
export function hasActiveAccess(user) {
  if (!hasDatabase) return true;
  if (user.plan !== 'FREE' && ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus)) return true;
  const end = trialEndsAt(user);
  return Boolean(end && end > new Date());
}

/**
 * Per le API route: risolve utente e attività, oppure restituisce la risposta di errore.
 * Uso: `const ctx = await requireAccount(); if (ctx.error) return ctx.error;`
 */
export async function requireAccount({ paid = false } = {}) {
  const userId = await getUserId();
  const account = await getAccount(userId);
  if (!account) {
    return { error: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }) };
  }
  if (paid && !hasActiveAccess(account.user)) {
    return {
      error: NextResponse.json(
        { error: 'Il periodo di prova è terminato. Scegli un piano per continuare.', upgrade: true },
        { status: 402 },
      ),
    };
  }
  return account;
}

export async function listReviews(business, { status, rating, source } = {}) {
  let reviews;
  if (!hasDatabase) {
    reviews = DEMO_REVIEWS;
  } else {
    reviews = await prisma.review.findMany({
      where: { businessId: business.id },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    });
  }
  return reviews.filter(
    (r) =>
      (!status || status === 'ALL' || r.replyStatus === status) &&
      (!rating || r.rating === Number(rating)) &&
      (!source || source === 'ALL' || r.source === source),
  );
}

export async function getReview(business, id) {
  if (!hasDatabase) return DEMO_REVIEWS.find((r) => r.id === id) || null;
  return prisma.review.findFirst({ where: { id, businessId: business.id } });
}

export function computeStats(reviews) {
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const replied = reviews.filter((r) => r.replyStatus === 'PUBLISHED').length;
  const pending = reviews.filter((r) => r.replyStatus !== 'PUBLISHED').length;

  const sentiment = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const topics = {};
  for (const r of reviews) {
    if (r.sentiment) sentiment[r.sentiment] += 1;
    ratings[r.rating] = (ratings[r.rating] || 0) + 1;
    for (const t of r.topics || []) {
      topics[t] ??= { topic: t, positive: 0, negative: 0 };
      if (r.sentiment === 'NEGATIVE') topics[t].negative += 1;
      else topics[t].positive += 1;
    }
  }

  // Andamento ultime 8 settimane (media voto per settimana)
  const weeks = [];
  const now = Date.now();
  for (let i = 7; i >= 0; i--) {
    const start = now - (i + 1) * 7 * 86400000;
    const end = now - i * 7 * 86400000;
    const inWeek = reviews.filter((r) => {
      const t = new Date(r.publishedAt).getTime();
      return t >= start && t < end;
    });
    weeks.push({
      label: new Date(end).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      count: inWeek.length,
      avg: inWeek.length ? inWeek.reduce((s, r) => s + r.rating, 0) / inWeek.length : null,
    });
  }

  return {
    total,
    avg: Math.round(avg * 10) / 10,
    replied,
    pending,
    responseRate: total ? Math.round((replied / total) * 100) : 0,
    sentiment,
    ratings,
    topics: Object.values(topics).sort((a, b) => b.positive + b.negative - (a.positive + a.negative)),
    weeks,
  };
}
