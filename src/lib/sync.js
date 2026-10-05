import { prisma } from './prisma';
import { analyzeReviewSentiment, generateReviewReply } from './ai';
import { fetchReviews, getGoogleAccessToken, publishReply } from './google';

/**
 * Importa le recensioni Google di un'attività e applica le automazioni:
 * - bozza AI per ogni nuova recensione senza risposta (autoDraftReplies)
 * - pubblicazione automatica se voto >= autoPublishMinRating (autoPublishReplies)
 * Lancia GoogleNotConnectedError se l'account Google non è collegato.
 */
export async function syncBusiness(business) {
  const token = await getGoogleAccessToken(business.userId);
  const reviews = await fetchReviews(token, business.googleLocationName);

  const existing = await prisma.review.findMany({
    where: { businessId: business.id, source: 'GOOGLE' },
    select: { id: true, externalId: true },
  });
  const known = new Map(existing.map((r) => [r.externalId, r.id]));

  const result = { imported: 0, updated: 0, drafted: 0, published: 0 };

  for (const r of reviews) {
    const replyData = r.reply ? { reply: r.reply, replyStatus: 'PUBLISHED', repliedAt: r.repliedAt } : {};
    const knownId = known.get(r.externalId);

    if (knownId) {
      // Non sovrascriviamo una bozza locale se su Google non c'è ancora risposta.
      await prisma.review.update({ where: { id: knownId }, data: { rating: r.rating, text: r.text, ...replyData } });
      result.updated += 1;
      continue;
    }

    const { sentiment, topics } = await analyzeReviewSentiment(r);
    const created = await prisma.review.create({
      data: {
        businessId: business.id,
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
    result.imported += 1;

    if (r.reply || !business.autoDraftReplies) continue;

    const { reply, demo } = await generateReviewReply({ review: created, business });
    // Mai pubblicare in automatico un testo di ripiego: solo risposte AI vere.
    const publish =
      !demo && business.autoPublishReplies && r.rating >= business.autoPublishMinRating && r.text.trim().length > 0;

    if (publish) {
      try {
        await publishReply(token, business.googleLocationName, r.externalId, reply);
        await prisma.review.update({
          where: { id: created.id },
          data: { reply, replyStatus: 'PUBLISHED', repliedAt: new Date() },
        });
        result.published += 1;
        continue;
      } catch (err) {
        console.error('Auto-publish failed', business.id, r.externalId, err);
      }
    }
    await prisma.review.update({ where: { id: created.id }, data: { reply, replyStatus: 'DRAFT' } });
    result.drafted += 1;
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { lastSyncedAt: new Date(), lastSyncError: null },
  });
  return result;
}
