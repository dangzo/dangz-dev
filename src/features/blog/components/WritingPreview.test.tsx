import { render, screen } from '@testing-library/react';
import WritingPreview from './WritingPreview';
import type { PostWithTopic } from '@/features/blog/types/Post.types';
import { TOPICS } from '@/features/blog/data/topics';

vi.mock('@/components/ui/Img', () => ({ default: () => <div data-testid="thumbnail" /> }));

const post: PostWithTopic = {
  _id: 'post',
  _type: 'post',
  _createdAt: '2026-01-01',
  _updatedAt: '2026-01-01',
  _rev: '1',
  title: 'A long article title that deserves to be read in full',
  slug: { _type: 'slug', current: 'long-article' },
  tags: [],
  primaryTopic: TOPICS[0],
  publishedAt: '2026-01-01',
};

describe('WritingPreview', () => {
  it.each([undefined, { _type: 'slug' as const }, { _type: 'slug' as const, current: '' }])('keeps images, content and topic navigation without article links when the slug is %j', (slug) => {
    render(<WritingPreview source="home" post={{ ...post, slug, image: { asset: { url: '/cover.jpg' } } }} summary="An article summary." />);

    expect(screen.getByRole('heading', { name: post.title })).toBeVisible();
    expect(screen.getByText('An article summary.')).toBeVisible();
    expect(screen.getByRole('link', { name: TOPICS[0].displayName })).toHaveAttribute('href', `/blog/topics/${TOPICS[0].slug.current}`);
    expect(screen.getByTestId('thumbnail').closest('a')).toBeNull();
    expect(screen.queryByRole('link', { name: post.title })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: `Read article: ${post.title}` })).not.toBeInTheDocument();
  });

  it('provides independent canonical topic and article links without nesting anchors', () => {
    const { container } = render(<WritingPreview source="home" post={post} summary="Learn to structure your application." />);

    expect(screen.getByRole('link', { name: TOPICS[0].displayName })).toHaveAttribute('href', `/blog/topics/${TOPICS[0].slug.current}`);
    expect(screen.getByRole('link', { name: post.title })).toHaveAttribute('href', '/blog/long-article');
    expect(screen.getByRole('link', { name: `Read article: ${post.title}` })).toHaveAttribute('href', '/blog/long-article');
    expect(container.querySelector('a a')).toBeNull();
    expect(screen.getByText('Learn to structure your application.')).toBeVisible();
  });

  it('omits absent images, topics, and summaries without fallback noise', () => {
    render(<WritingPreview source="home" post={{ ...post, primaryTopic: null }} />);

    expect(screen.queryByTestId('thumbnail')).not.toBeInTheDocument();
    expect(screen.queryByText(TOPICS[0].displayName)).not.toBeInTheDocument();
    expect(screen.queryByText(/no description/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: post.title })).toBeVisible();
  });
});

it('marks home article entry points without marking images or topics', () => {
  const { container } = render(<WritingPreview source="home" post={post} />);
  const links = container.querySelectorAll('a[data-post-opened-post-id]');
  expect(Array.from(links).map((link) => ({
    id: link.getAttribute('data-post-opened-post-id'),
    source: link.getAttribute('data-post-opened-source'),
    placement: link.getAttribute('data-post-opened-placement'),
  }))).toEqual(['title', 'cta'].map((placement) => ({ id: post._id, source: 'home', placement })));
  expect(container.querySelector('a[data-umami-event]')).toBeNull();
});

it.each(['home', 'article'] as const)('links covers and uses the %s discovery source for titles and CTAs', (source) => {
  const { container } = render(<WritingPreview source={source} post={{ ...post, image: { asset: { url: '/cover.jpg' } } }} />);

  const imageLink = screen.getByRole('link', { name: `Open article: ${post.title}` });
  expect(imageLink).toContainElement(screen.getByTestId('thumbnail'));
  expect(imageLink).toHaveAttribute('href', '/blog/long-article');
  expect(imageLink).not.toHaveAttribute('data-post-opened-post-id');
  expect(container.querySelector('a a')).toBeNull();
  expect(Array.from(container.querySelectorAll('a[data-post-opened-post-id]')).map((link) => ({
    source: link.getAttribute('data-post-opened-source'),
    placement: link.getAttribute('data-post-opened-placement'),
  }))).toEqual(['title', 'cta'].map((placement) => ({ source, placement })));
});
