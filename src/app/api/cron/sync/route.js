import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase, hasGoogle } from '@/lib/env';
import { rejectUnauthorizedCron } from '@/lib/cron';
import { hasActiveAccess } from '@/lib/data';
import { GoogleNotConnectedError } from '@/lib/google';
import { syncBusiness } from '@/lib/sync';

export const maxDuration = 300;

// Lascia margine prima del timeout: le attività non elaborate passano al giro successivo.
const TIME_BUDGET_MS = 240_000;

/** Ogni ora: importa le recensioni di tutte le attività con Google collegato e abbonamento/prova attivi. */
export async function GET(req) {
  const denied = rejectUnauthorizedCron(req);
  if (denied) return denied;
  if (!hasDatabase || !hasGoogle) return NextResponse.json({ skipped: 'database o Google non configurati' });

  const started = Date.now();
  const businesses = await prisma.business.findMany({
    where: { googleLocationName: { not: null } },
    include: { user: true },
    // Le meno aggiornate per prime, così nessuna resta indietro.
    orderBy: { lastSyncedAt: { sort: 'asc', nulls: 'first' } },
  });

  const summary = { processed: 0, skipped: 0, failed: 0, imported: 0, drafted: 0, published: 0 };
  for (const business of businesses) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    if (!hasActiveAccess(business.user)) {
      summary.skipped += 1;
      continue;
    }
    try {
      const r = await syncBusiness(business);
      summary.processed += 1;
      summary.imported += r.imported;
      summary.drafted += r.drafted;
      summary.published += r.published;
    } catch (err) {
      summary.failed += 1;
      const message = err instanceof GoogleNotConnectedError ? 'Account Google scollegato' : String(err.message).slice(0, 300);
      await prisma.business.update({ where: { id: business.id }, data: { lastSyncError: message } });
      console.error('Cron sync failed', business.id, err);
    }
  }

  return NextResponse.json({ ...summary, total: businesses.length, ms: Date.now() - started });
}
