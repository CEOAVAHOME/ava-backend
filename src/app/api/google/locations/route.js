import { NextResponse } from 'next/server';
import { hasDatabase, hasGoogle } from '@/lib/env';
import { requireAccount } from '@/lib/data';
import { getGoogleAccessToken, GoogleNotConnectedError, listLocations } from '@/lib/google';

export async function GET() {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;
  if (!hasDatabase || !hasGoogle) return NextResponse.json({ locations: [], demo: true });

  try {
    const token = await getGoogleAccessToken(ctx.user.id);
    return NextResponse.json({ locations: await listLocations(token) });
  } catch (err) {
    if (err instanceof GoogleNotConnectedError) {
      return NextResponse.json({ error: 'Account Google non collegato', locations: [] }, { status: 400 });
    }
    console.error('Google locations failed', err);
    return NextResponse.json({ error: 'Impossibile leggere le sedi da Google', locations: [] }, { status: 502 });
  }
}
