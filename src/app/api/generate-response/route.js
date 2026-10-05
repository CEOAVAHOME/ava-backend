import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { generateReviewReply } from '@/lib/ai';
import { getReview, requireAccount } from '@/lib/data';

/**
 * POST { reviewId } oppure { review: { author, rating, text } }, opzionale { tone }
 * Se viene passato reviewId, la risposta viene salvata come bozza.
 */
export async function POST(req) {
  const ctx = await requireAccount({ paid: true });
  if (ctx.error) return ctx.error;

  const body = await req.json().catch(() => ({}));
  let review = body.review;
  if (body.reviewId) {
    review = await getReview(ctx.business, body.reviewId);
    if (!review) return NextResponse.json({ error: 'Recensione non trovata' }, { status: 404 });
  }
  if (!review?.text || !review?.rating) {
    return NextResponse.json({ error: 'Recensione mancante' }, { status: 400 });
  }

  const { reply, demo } = await generateReviewReply({ review, business: ctx.business, tone: body.tone });

  if (body.reviewId && hasDatabase) {
    await prisma.review.update({
      where: { id: review.id },
      data: { reply, replyStatus: review.replyStatus === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT' },
    });
  }

  return NextResponse.json({ reply, demo });
}
