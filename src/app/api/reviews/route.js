import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { analyzeReviewSentiment } from '@/lib/ai';
import { computeStats, listReviews, requireAccount } from '@/lib/data';

/** GET ?status=PENDING|DRAFT|PUBLISHED&rating=1..5&source=GOOGLE|TRIPADVISOR|MANUAL */
export async function GET(req) {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;

  const { searchParams } = new URL(req.url);
  const filters = Object.fromEntries(['status', 'rating', 'source'].map((k) => [k, searchParams.get(k)]));
  const reviews = await listReviews(ctx.business, filters);
  const stats = computeStats(await listReviews(ctx.business));

  return NextResponse.json({ reviews, stats, business: ctx.business });
}

/** POST { author, rating, text, source?, publishedAt? } — inserimento manuale (es. TripAdvisor). */
export async function POST(req) {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;

  const body = await req.json().catch(() => ({}));
  const rating = Number(body.rating);
  if (!body.author?.trim() || !body.text?.trim() || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: 'Autore, testo e voto (1-5) sono obbligatori' }, { status: 400 });
  }
  if (!hasDatabase) {
    return NextResponse.json({ error: 'Collega un database per salvare le recensioni' }, { status: 400 });
  }

  const source = ['TRIPADVISOR', 'MANUAL'].includes(body.source) ? body.source : 'MANUAL';
  const { sentiment, topics } = await analyzeReviewSentiment({ rating, text: body.text });
  const review = await prisma.review.create({
    data: {
      businessId: ctx.business.id,
      source,
      author: body.author.trim(),
      rating,
      text: body.text.trim(),
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      sentiment,
      topics,
    },
  });
  return NextResponse.json({ review }, { status: 201 });
}
