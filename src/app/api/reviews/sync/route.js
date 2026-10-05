import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase, hasGoogle } from '@/lib/env';
import { analyzeReviewSentiment } from '@/lib/ai';
import { requireAccount } from '@/lib/data';
import { fetchReviews, getGoogleAccessToken, GoogleNotConnectedError } from '@/lib/google';

export const maxDuration = 60;

/** POST → importa/aggiorna le recensioni Google della sede collegata. */
export async function POST() {
  const ctx = await requireAccount({ paid: true });
  if (ctx.error) return ctx.error;

  if (!hasDatabase || !hasGoogle) {
    return NextResponse.json({ imported: 0, updated: 0, demo: true });
  }
  if (!ctx.business.googleLocationName) {
    return NextResponse.json({ error: 'Seleziona prima la sede Google nelle Impostazioni' }, { status: 400 });
  }

  let reviews;
  try {
    const token = await getGoogleAccessToken(ctx.user.id);
    reviews = await fetchReviews(token, ctx.business.googleLocationName);
  } catch (err) {
    if (err instanceof GoogleNotConnectedError) {
      return NextResponse.json({ error: 'Collega il tuo account Google nelle Impostazioni' }, { status: 400 });
    }
    console.error('Google sync failed', err);
    return NextResponse.json({ error: 'Errore durante la sincronizzazione con Google' }, { status: 502 });
  }

  const existing = await prisma.review.findMany({
    where: { businessId: ctx.business.id, source: 'GOOGLE' },
    select: { id: true, externalId: true, replyStatus: true },
  });
  const byExternalId = new Map(existing.map((r) => [r.externalId, r]));

  let imported = 0;
  let updated = 0;
  for (const r of reviews) {
    const known = byExternalId.get(r.externalId);
    const replyData = r.reply ? { reply: r.reply, replyStatus: 'PUBLISHED', repliedAt: r.repliedAt } : {};

    if (known) {
      // Non sovrascriviamo una bozza locale se su Google non c'è ancora risposta.
      await prisma.review.update({
        where: { id: known.id },
        data: { rating: r.rating, text: r.text, ...replyData },
      });
      updated += 1;
    } else {
      const { sentiment, topics } = await analyzeReviewSentiment(r);
      await prisma.review.create({
        data: {
          businessId: ctx.business.id,
          source: 'GOOGLE',
          externalId: r.externalId,
          author: r.author,
          rating: r.rating,
          text: r.text,
          publishedAt: r.publishedAt,
          sentiment,
          topics,
          ...replyData,
        },
      });
      imported += 1;
    }
  }

  await prisma.business.update({ where: { id: ctx.business.id }, data: { lastSyncedAt: new Date() } });
  return NextResponse.json({ imported, updated });
}
