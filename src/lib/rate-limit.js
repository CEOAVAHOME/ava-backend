import { createHash } from 'crypto';
import { prisma } from './prisma';
import { hasDatabase } from './env';

const memory = new Map(); // fallback in modalità demo

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function hashIp(ip) {
  // IP mai salvato in chiaro (GDPR): hash con sale segreto.
  return createHash('sha256').update(`${process.env.NEXTAUTH_SECRET || 'rg'}:${ip}`).digest('hex').slice(0, 32);
}

export function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

/** Incrementa il contatore e restituisce il nuovo valore per (chiave, giorno). */
async function hit(key) {
  const day = today();
  if (!hasDatabase) {
    const k = `${key}:${day}`;
    memory.set(k, (memory.get(k) || 0) + 1);
    return memory.get(k);
  }
  const row = await prisma.freeToolUsage.upsert({
    where: { ipHash_day: { ipHash: key, day } },
    create: { ipHash: key, day, count: 1 },
    update: { count: { increment: 1 } },
  });
  return row.count;
}

/**
 * Limite per visitatore + tetto globale giornaliero (protegge la spesa OpenAI).
 * Restituisce { ok, remaining }.
 */
export async function consumeFreeUse(req, { perIp = 3, globalCap = Number(process.env.FREE_TOOL_DAILY_CAP || 300) } = {}) {
  const used = await hit(hashIp(clientIp(req)));
  if (used > perIp) return { ok: false, remaining: 0, reason: 'ip' };
  const total = await hit('GLOBAL');
  if (total > globalCap) return { ok: false, remaining: 0, reason: 'global' };
  return { ok: true, remaining: perIp - used };
}
