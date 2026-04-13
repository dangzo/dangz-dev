import { NextResponse } from 'next/server';
import { getSearchablePosts } from '@/api/queries/posts';

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  score: number;
};

const normalize = (value: string) => value.trim().toLowerCase();

const scorePost = ({
  query,
  title,
  excerpt,
  tags,
}: {
  query: string;
  title: string;
  excerpt: string;
  tags: string[];
}) => {
  let score = 0;

  const lowerTitle = title.toLowerCase();
  const lowerExcerpt = excerpt.toLowerCase();
  const lowerTags = tags.map((tag) => tag.toLowerCase());

  if (lowerTitle.includes(query)) score += 6;
  if (lowerExcerpt.includes(query)) score += 4;

  const tagHits = lowerTags.filter((tag) => tag.includes(query)).length;
  score += tagHits * 3;

  return score;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const query = normalize(q);

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const posts = await getSearchablePosts();

  const results: SearchResult[] = posts
    .map((post) => {
      const title = post.title ?? '';
      const slug = post.slug?.current ?? '';
      const excerpt = post.excerpt ?? '';
      const tags = (post.tags ?? []).flatMap((tag) =>
        [tag.name, tag.slug?.current].filter(
          (value): value is string => typeof value === 'string' && value.length > 0,
        ),
      );

      const score = scorePost({
        query,
        title,
        excerpt,
        tags,
      });

      return {
        id: post._id,
        slug,
        title,
        excerpt,
        tags,
        score,
      };
    })
    .filter((item) => item.score > 0 && item.slug)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return NextResponse.json({ results });
}
