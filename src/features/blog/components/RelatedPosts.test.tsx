import { render, screen } from '@testing-library/react';
import RelatedPosts from './RelatedPosts';
import type { PostWithTopic } from '@/features/blog/types/Post.types';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const post: PostWithTopic = {
  _id: 'related-post',
  _type: 'post',
  _createdAt: '2026-01-01',
  _updatedAt: '2026-01-01',
  _rev: '1',
  title: 'A useful next read',
  slug: { _type: 'slug', current: 'next-read' },
  publishedAt: '2026-01-01',
  excerpt: 'A practical continuation of the article.',
  tags: [],
};

it('omits an empty recommendation section', () => {
  const { container } = render(<RelatedPosts posts={[]} />);

  expect(container).toBeEmptyDOMElement();
});

it('renders an accessible next-read section with article discovery links', () => {
  render(<RelatedPosts posts={[post]} />);

  const section = screen.getByRole('region', { name: 'What to read next' });
  expect(section).toContainElement(screen.getByRole('heading', { level: 2, name: 'What to read next' }));
  expect(screen.getByRole('link', { name: post.title })).toHaveAttribute('href', '/blog/next-read');
  expect(screen.getByText(post.excerpt ?? '')).toBeVisible();

  const links = section.querySelectorAll('a[data-post-opened-source="article"]');
  expect(Array.from(links).map((link) => link.getAttribute('data-post-opened-placement'))).toEqual(['title', 'cta']);
  expect(section.querySelector('img')).toBeNull();
  expect(section.querySelector('article')).not.toBeNull();
  expect(screen.getByRole('link', { name: `Read article: ${post.title}` })).toHaveAttribute('href', '/blog/next-read');
  expect(section.querySelector('a[data-umami-event]')).toBeNull();
});

it('reuses the writing card with separate cover, title and reading links', () => {
  render(<RelatedPosts posts={[{
    ...post,
    imageAltText: 'Article cover',
    image: { asset: { url: 'https://cdn.sanity.io/images/wdxhl3tc/production/098fa2b1b448e79f99fd53f629d2fb721bdec4a2-1536x1024.png' } },
  }]} />);

  const link = screen.getByRole('link', { name: `Open article: ${post.title}` });
  const image = link.querySelector('img');
  expect(image).toHaveAttribute('loading', 'lazy');
  expect(image).toHaveAttribute('width', '720');
  expect(image).toHaveAttribute('height', '405');
  expect(image?.getAttribute('sizes')).toContain('(min-width: 1200px) 368px');
  expect(image).toHaveAttribute('alt', 'Article cover');
  expect(screen.getAllByRole('link')).toHaveLength(3);
  expect(screen.getByText('→')).toBeVisible();
});
