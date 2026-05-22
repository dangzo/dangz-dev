import { NextResponse } from 'next/server';
import { incrementReactionCount } from '@/features/blog/api/queries/reactions';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      reactionId?: string;
      currentCount?: number;
    };

    if (!body.reactionId || typeof body.reactionId !== 'string') {
      return NextResponse.json({ error: 'reactionId is required.' }, { status: 400 });
    }

    if (typeof body.currentCount !== 'number' || body.currentCount < 0) {
      return NextResponse.json({ error: 'currentCount must be a non-negative number.' }, { status: 400 });
    }

    const count = await incrementReactionCount(body.reactionId, body.currentCount);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error updating reaction count:', error);
    return NextResponse.json({ error: 'Unable to update reaction count.' }, { status: 500 });
  }
}