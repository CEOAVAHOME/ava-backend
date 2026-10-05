import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { sendOnce } from '@/lib/email';

export async function POST(req) {
  if (!hasDatabase) {
    return NextResponse.json(
      { error: 'Registrazione non disponibile in modalità demo. Accedi con demo@reviewgenius.it / demo1234.' },
      { status: 400 },
    );
  }

  const { name, email, password, businessName, category } = await req.json().catch(() => ({}));
  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'La password deve avere almeno 8 caratteri' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'Esiste già un account con questa email' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: name?.trim() || null,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      businesses: {
        create: { name: businessName?.trim() || 'La mia attività', category: category || 'ristorante' },
      },
    },
  });

  await sendOnce(user, 'welcome', 'once');

  return NextResponse.json({ id: user.id }, { status: 201 });
}
