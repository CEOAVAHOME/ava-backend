import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { CATEGORIES, TONES } from '@/lib/plans';
import { requireAccount, trialEndsAt } from '@/lib/data';

export async function GET() {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;

  let googleConnected = false;
  if (hasDatabase) {
    googleConnected = Boolean(
      await prisma.account.findFirst({ where: { userId: ctx.user.id, provider: 'google' }, select: { id: true } }),
    );
  }
  return NextResponse.json({
    business: ctx.business,
    user: ctx.user,
    trialEndsAt: trialEndsAt(ctx.user),
    googleConnected,
    demo: ctx.demo,
  });
}

export async function PUT(req) {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;

  const body = await req.json().catch(() => ({}));
  const data = {};
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body.city === 'string') data.city = body.city.trim() || null;
  if (CATEGORIES.some((c) => c.id === body.category)) data.category = body.category;
  if (TONES.some((t) => t.id === body.tone)) data.tone = body.tone;
  if (typeof body.googleLocationName === 'string') {
    if (body.googleLocationName && !/^accounts\/[^/]+\/locations\/[^/]+$/.test(body.googleLocationName)) {
      return NextResponse.json({ error: 'Sede Google non valida' }, { status: 400 });
    }
    data.googleLocationName = body.googleLocationName || null;
  }

  if (typeof body.autoDraftReplies === 'boolean') data.autoDraftReplies = body.autoDraftReplies;
  if (typeof body.autoPublishReplies === 'boolean') data.autoPublishReplies = body.autoPublishReplies;
  if ([3, 4, 5].includes(Number(body.autoPublishMinRating))) data.autoPublishMinRating = Number(body.autoPublishMinRating);
  const userData = typeof body.weeklyDigest === 'boolean' ? { weeklyDigest: body.weeklyDigest } : {};

  if (!hasDatabase) return NextResponse.json({ business: { ...ctx.business, ...data }, demo: true });

  const business = await prisma.business.update({ where: { id: ctx.business.id }, data });
  if (Object.keys(userData).length) await prisma.user.update({ where: { id: ctx.user.id }, data: userData });
  return NextResponse.json({ business });
}
