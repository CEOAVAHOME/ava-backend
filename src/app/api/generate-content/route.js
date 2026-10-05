import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabase } from '@/lib/env';
import { generateSocialPost } from '@/lib/ai';
import { requireAccount } from '@/lib/data';

const PLATFORMS = ['instagram', 'facebook', 'google'];

export async function GET() {
  const ctx = await requireAccount();
  if (ctx.error) return ctx.error;
  if (!hasDatabase) return NextResponse.json({ posts: [] });

  const posts = await prisma.generatedPost.findMany({
    where: { businessId: ctx.business.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ posts });
}

export async function POST(req) {
  const ctx = await requireAccount({ paid: true });
  if (ctx.error) return ctx.error;

  const { platform = 'instagram', topic, tone } = await req.json().catch(() => ({}));
  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Piattaforma non supportata' }, { status: 400 });
  }
  if (!topic?.trim()) {
    return NextResponse.json({ error: 'Indica l\'argomento del post' }, { status: 400 });
  }

  const post = await generateSocialPost({ business: ctx.business, platform, topic: topic.trim(), tone });

  let id = null;
  if (hasDatabase) {
    const saved = await prisma.generatedPost.create({
      data: { businessId: ctx.business.id, platform, topic: topic.trim(), content: post.content, hashtags: post.hashtags },
    });
    id = saved.id;
  }

  return NextResponse.json({ id, ...post });
}
