import { NextResponse } from 'next/server';
import { hasDatabase, hasGoogle } from '@/lib/env';
import { requireAccount } from '@/lib/data';
import { GoogleNotConnectedError } from '@/lib/google';
import { syncBusiness } from '@/lib/sync';

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

  try {
    return NextResponse.json(await syncBusiness(ctx.business));
  } catch (err) {
    if (err instanceof GoogleNotConnectedError) {
      return NextResponse.json({ error: 'Collega il tuo account Google nelle Impostazioni' }, { status: 400 });
    }
    console.error('Google sync failed', err);
    return NextResponse.json({ error: 'Errore durante la sincronizzazione con Google' }, { status: 502 });
  }
}
