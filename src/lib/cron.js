import { NextResponse } from 'next/server';

/**
 * Vercel Cron invia `Authorization: Bearer ${CRON_SECRET}`.
 * Restituisce una risposta di errore se la richiesta non è autorizzata, altrimenti null.
 */
export function rejectUnauthorizedCron(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET non configurato' }, { status: 501 });
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  return null;
}
