import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { getReview, requireAccount } from '@/lib/data';
import { getGoogleAccessToken, GoogleNotConnectedError, publishReply } from '@/lib/google';

/**
 * PUT { reply, publish }
 * publish=false → salva bozza; publish=true → pubblica su Google (se la recensione viene da lì)
 * oppure la segna come pubblicata (TripAdvisor/manuale, dove si incolla a mano).
 */
export async function PUT(req, { params }) {
  const ctx = await requireAccount({ paid: true });
  if (ctx.error) return ctx.error;

  const { reply, publish = false } = await req.json().catch(() => ({}));
  if (!reply?.trim()) return NextResponse.json({ error: 'La risposta è vuota' }, { status: 400 });

  const { id } = await params;
  const review = await getReview(ctx.business, id);
  if (!review) return NextResponse.json({ error: 'Recensione non trovata' }, { status: 404 });

  if (!hasDatabase) {
    return NextResponse.json({ review: { ...review, reply, replyStatus: publish ? 'PUBLISHED' : 'DRAFT' }, demo: true });
  }

  let postedToGoogle = false;
  if (publish && review.source === 'GOOGLE' && review.externalId && ctx.business.googleLocationName) {
    try {
      const token = await getGoogleAccessToken(ctx.user.id);
      await publishReply(token, ctx.business.googleLocationName, review.externalId, reply.trim());
      postedToGoogle = true;
    } catch (err) {
      if (err instanceof GoogleNotConnectedError) {
        return NextResponse.json({ error: 'Collega il tuo account Google nelle Impostazioni' }, { status: 400 });
      }
      console.error('Google reply failed', err);
      return NextResponse.json({ error: 'Google ha rifiutato la pubblicazione. Riprova più tardi.' }, { status: 502 });
    }
  }

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: {
      reply: reply.trim(),
      replyStatus: publish ? 'PUBLISHED' : 'DRAFT',
      repliedAt: publish ? new Date() : review.repliedAt,
    },
  });
  return NextResponse.json({ review: updated, postedToGoogle });
}
