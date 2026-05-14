import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

type WebhookSlug = {
  current?: string;
};

type WebhookBody = {
  _type?: 'post' | 'tag';
  operation?: 'create' | 'update' | 'delete';
  slug?: WebhookSlug;
  previousSlug?: string;
  previous?: {
    slug?: WebhookSlug;
  };
  tags?: Array<{
    slug?: WebhookSlug;
  }>;
  previousTags?: Array<{
    slug?: WebhookSlug;
  }>;
};

const webhookSecret = process.env.SANITY_REVALIDATE_SECRET;

const getPreviousSlug = (body: WebhookBody): string | undefined => {
  return body.previousSlug ?? body.previous?.slug?.current;
};

const addPath = (paths: Set<string>, path: string | undefined) => {
  if (!path) {
    return;
  }

  const normalized = path.trim();
  if (!normalized) {
    return;
  }

  paths.add(normalized.startsWith('/') ? normalized : `/${normalized}`);
};

const parseWebhookBody = async <Body>(request: NextRequest, secret: string) => {
  // next-sanity can resolve NextRequest from a nested next installation in CI.
  // Keep NextRequest on the route boundary for ergonomics, and isolate the
  // compatibility cast here where parseBody is called.
  return parseBody<Body>(request as Parameters<typeof parseBody>[0], secret);
};

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, message: 'Missing SANITY_REVALIDATE_SECRET' },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseWebhookBody<WebhookBody>(
    request,
    webhookSecret,
  );

  if (!isValidSignature) {
    return NextResponse.json(
      { ok: false, message: 'Invalid webhook signature' },
      { status: 401 },
    );
  }

  if (!body?._type) {
    return NextResponse.json(
      { ok: false, message: 'Missing webhook payload type' },
      { status: 400 },
    );
  }

  const pathsToRevalidate = new Set<string>();

  // Global entry points that surface posts/tags.
  addPath(pathsToRevalidate, '/');
  addPath(pathsToRevalidate, '/blog');
  addPath(pathsToRevalidate, '/api/search');

  if (body._type === 'post') {
    const currentSlug = body.slug?.current;
    const previousSlug = getPreviousSlug(body);

    addPath(pathsToRevalidate, currentSlug ? `/blog/${currentSlug}` : undefined);
    addPath(pathsToRevalidate, previousSlug ? `/blog/${previousSlug}` : undefined);

    (body.tags ?? []).forEach((tag) => {
      const tagSlug = tag.slug?.current;
      addPath(pathsToRevalidate, tagSlug ? `/blog/tags/${tagSlug}` : undefined);
    });

    (body.previousTags ?? []).forEach((tag) => {
      const tagSlug = tag.slug?.current;
      addPath(pathsToRevalidate, tagSlug ? `/blog/tags/${tagSlug}` : undefined);
    });
  }

  if (body._type === 'tag') {
    const currentTagSlug = body.slug?.current;
    const previousTagSlug = getPreviousSlug(body);

    addPath(pathsToRevalidate, currentTagSlug ? `/blog/tags/${currentTagSlug}` : undefined);
    addPath(pathsToRevalidate, previousTagSlug ? `/blog/tags/${previousTagSlug}` : undefined);
  }

  const revalidated: string[] = [];
  pathsToRevalidate.forEach((path) => {
    revalidatePath(path);
    revalidated.push(path);
  });

  return NextResponse.json({
    ok: true,
    type: body._type,
    operation: body.operation ?? 'unknown',
    revalidated,
  });
}
