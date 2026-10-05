import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase, TRIAL_DAYS } from '@/lib/env';
import { rejectUnauthorizedCron } from '@/lib/cron';
import { buildInsights } from '@/lib/ai';
import { hasActiveAccess } from '@/lib/data';
import { sendOnce } from '@/lib/email';

export const maxDuration = 300;

const DAY = 86400000;

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / DAY + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Ogni giorno: email di fine prova; il lunedì anche il riepilogo settimanale. */
export async function GET(req) {
  const denied = rejectUnauthorizedCron(req);
  if (denied) return denied;
  if (!hasDatabase) return NextResponse.json({ skipped: 'database non configurato' });

  const now = new Date();
  const sent = { trial_ending: 0, trial_ended: 0, weekly_digest: 0 };

  // --- Prova in scadenza (entro 3 giorni) o appena scaduta (ultimi 7 giorni) ---
  const trialUsers = await prisma.user.findMany({
    where: {
      plan: 'FREE',
      createdAt: { gte: new Date(now - (TRIAL_DAYS + 7) * DAY), lte: new Date(now - (TRIAL_DAYS - 3) * DAY) },
    },
  });
  for (const user of trialUsers) {
    const trialEnd = new Date(user.createdAt.getTime() + TRIAL_DAYS * DAY);
    if (trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd - now) / DAY);
      if (await sendOnce(user, 'trial_ending', 'once', { daysLeft })) sent.trial_ending += 1;
    } else if (await sendOnce(user, 'trial_ended', 'once')) {
      sent.trial_ended += 1;
    }
  }

  // --- Riepilogo settimanale (lunedì) ---
  if (now.getUTCDay() === 1) {
    const weekKey = isoWeekKey(now);
    const since = new Date(now - 7 * DAY);
    const users = await prisma.user.findMany({
      where: { weeklyDigest: true, email: { not: null } },
      include: { businesses: { take: 1, orderBy: { createdAt: 'asc' } } },
    });
    for (const user of users) {
      const business = user.businesses[0];
      if (!business || !hasActiveAccess(user)) continue;

      const [recent, pending] = await Promise.all([
        prisma.review.findMany({ where: { businessId: business.id, publishedAt: { gte: since } } }),
        prisma.review.count({ where: { businessId: business.id, replyStatus: { not: 'PUBLISHED' } } }),
      ]);
      if (recent.length === 0 && pending === 0) continue;

      const avg = recent.length ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : 0;
      const stats = {
        newCount: recent.length,
        avg: recent.length ? avg.toFixed(1).replace('.', ',') : '—',
        autoPublished: recent.filter((r) => r.replyStatus === 'PUBLISHED').length,
        pending,
        topIssue: buildInsights(recent)[0]?.topic,
      };
      if (await sendOnce(user, 'weekly_digest', weekKey, { business, stats })) sent.weekly_digest += 1;
    }
  }

  return NextResponse.json({ sent });
}
