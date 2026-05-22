import { NextResponse } from 'next/server';
import { getReactionsForPost, incrementReactionCount } from '@/features/blog/api/queries/reactions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'postId is required.' }, { status: 400 });
  }

  try {
    const reactions = await getReactionsForPost(postId);
    return NextResponse.json({ reactions }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch reactions.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      postId?: string;
      reactionId?: string;
      currentCount?: number;
    };

    if (!body.postId || typeof body.postId !== 'string') {
      return NextResponse.json({ error: 'postId is required.' }, { status: 400 });
    }

    if (!body.reactionId || typeof body.reactionId !== 'string') {
      return NextResponse.json({ error: 'reactionId is required.' }, { status: 400 });
    }

    if (typeof body.currentCount !== 'number' || body.currentCount < 0) {
      return NextResponse.json({ error: 'currentCount must be a non-negative number.' }, { status: 400 });
    }

    const count = await incrementReactionCount(body.postId, body.reactionId, body.currentCount);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Unable to update reaction count.' }, { status: 500 });
  }
}