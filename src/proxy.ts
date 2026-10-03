import { NextResponse, type NextRequest } from 'next/server';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { resolveLegacyTagRedirect, getTopicHref } from '@/features/blog/utils/topics';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const legacyMatch = /^\/blog\/tags\/([^/]+)(?:\/page\/([^/]+))?$/.exec(pathname);
  const firstPageMatch = /^\/blog\/topics\/([^/]+)\/page\/1$/.exec(pathname);

  if (!legacyMatch && !firstPageMatch) {
    return NextResponse.next();
  }

  // Decide permanent destinations before the App Router can stream a response.
  // Legacy destinations use published counts; canonical routes follow the current perspective.
  const { topics, totalPostCount } = await getTopicsWithCount({ publishedOnly: Boolean(legacyMatch), outsideRender: true });
  let destination: string | null = null;

  if (legacyMatch) {
    const counts = { ...Object.fromEntries(topics.map(topic => [topic.slug.current, topic.postCount])), all: totalPostCount };
    destination = resolveLegacyTagRedirect(legacyMatch[1], legacyMatch[2], counts);
  } else if (firstPageMatch) {
    const topic = topics.find(candidate => candidate.slug.current === firstPageMatch[1] && candidate.postCount > 0);
    destination = topic ? getTopicHref(topic) : null;
  }

  if (!destination) {
    return NextResponse.next();
  }

  const destinationUrl = request.nextUrl.clone();
  destinationUrl.pathname = destination;

  return NextResponse.redirect(destinationUrl, 308);
}

export const config = {
  matcher: ['/blog/tags/:path*', '/blog/topics/:slug/page/1'],
};
