import { NextResponse } from 'next/server';
import { generateReviewReply } from '@/lib/ai';
import { CATEGORIES, TONES } from '@/lib/plans';
import { consumeFreeUse } from '@/lib/rate-limit';

/** Strumento gratuito pubblico: una risposta AI senza account, max 3 al giorno per visitatore. */
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const text = String(body.text || '').trim().slice(0, 1500);
  const rating = Number(body.rating);
  if (text.length < 10 || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: 'Incolla il testo della recensione e indica il voto' }, { status: 400 });
  }

  const quota = await consumeFreeUse(req);
  if (!quota.ok) {
    return NextResponse.json(
      {
        error:
          quota.reason === 'ip'
            ? 'Hai usato le 3 risposte gratuite di oggi. Crea un account per risposte illimitate per 14 giorni.'
            : 'Lo strumento gratuito ha raggiunto il limite di oggi. Crea un account per continuare subito.',
        limit: true,
      },
      { status: 429 },
    );
  }

  const business = {
    name: String(body.businessName || '').trim().slice(0, 80) || 'la nostra attività',
    category: CATEGORIES.some((c) => c.id === body.category) ? body.category : 'altro',
  };
  const tone = TONES.some((t) => t.id === body.tone) ? body.tone : 'cordiale';
  const author = String(body.author || '').trim().slice(0, 60) || 'Cliente';

  const { reply, demo } = await generateReviewReply({ review: { author, rating, text }, business, tone });
  return NextResponse.json({ reply, demo, remaining: quota.remaining });
}
