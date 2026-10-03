import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { CMS_CONTENT_CACHE_TAG, SEARCH_CORPUS_CACHE_TAG } from '@/api/apollo-client';

type WebhookBody = Readonly<{
  _type: 'post' | 'topic' | 'tag';
  operation?: 'create' | 'update' | 'delete';
  slug?: Readonly<{ current?: string }>;
  previousSlug?: string;
  previous?: Readonly<{ slug?: Readonly<{ current?: string }> }>;
}>;

const isWebhookBody = (value: unknown): value is WebhookBody => {
  if (!value || typeof value !== 'object' || !('_type' in value)) {
    return false;
  }

  return value._type === 'post' || value._type === 'topic' || value._type === 'tag';
};

const parseWebhookBody = async (request: NextRequest, secret: string) => {
  // next-sanity can resolve NextRequest from a nested Next installation in CI.
  return parseBody<unknown>(
    request as unknown as Parameters<typeof parseBody>[0],
    secret,
  );
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, message: 'Missing SANITY_REVALIDATE_SECRET' },
      { status: 500 },
    );
  }

  let payload: Awaited<ReturnType<typeof parseWebhookBody>>;

  try {
    payload = await parseWebhookBody(request, secret);
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid webhook payload' }, { status: 400 });
  }

  if (!payload.isValidSignature) {
    return NextResponse.json(
      { ok: false, message: 'Invalid webhook signature' },
      { status: 401 },
    );
  }

  if (!isWebhookBody(payload.body)) {
    return NextResponse.json(
      { ok: false, message: 'Unsupported webhook payload type' },
      { status: 400 },
    );
  }

  const body = payload.body;
  const paths = new Set(['/', '/blog', '/api/search', '/sitemap.xml']);

  if (body._type === 'post') {
    const slugs = [body.slug?.current, body.previousSlug, body.previous?.slug?.current];

    for (const slug of slugs) {
      if (typeof slug === 'string' && slug.trim()) {
        paths.add(`/blog/${slug.trim()}`);
      }
    }
  }

  // Reassignment, topic renames, deletes, and pagination changes affect every
  // archive and parallel route slot, including former topic destinations.
  revalidatePath('/blog', 'layout');

  for (const path of paths) {
    if (path !== '/blog') {
      revalidatePath(path);
    }
  }

  revalidateTag(CMS_CONTENT_CACHE_TAG, { expire: 0 });
  revalidateTag(SEARCH_CORPUS_CACHE_TAG, { expire: 0 });

  return NextResponse.json({
    ok: true,
    type: body._type,
    operation: body.operation ?? 'unknown',
    revalidated: [...paths],
  });
}
