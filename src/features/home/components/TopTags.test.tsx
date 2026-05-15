import { render, screen } from '@testing-library/react';

import { TopTags, TopTagsSkeleton } from './TopTags';
import { getTagsWithCount } from '@/features/blog/api/queries/tags';

vi.mock('@/components/ui/TagChip', () => ({
  default: function TagChipMock({ name }: { name?: string }) {
    return <span data-testid="tag-chip">#{name}</span>;
  },
}));

vi.mock('react-loading-skeleton', () => ({
  default: function SkeletonMock({ width, height }: { width?: number; height?: number }) {
    return <div data-testid="top-tag-skeleton" data-width={width} data-height={height} />;
  },
}));

vi.mock('@/features/blog/api/queries/tags', () => ({
  getTagsWithCount: vi.fn(),
}));

describe('TopTags', () => {
  it('renders up to 7 tags sorted by post count desc then name asc, excluding zero-count tags', async () => {
    const tags = [
      { _id: 'react', name: 'React', slug: { current: 'react' } },
      { _id: 'vue', name: 'Vue', slug: { current: 'vue' } },
      { _id: 'angular', name: 'Angular', slug: { current: 'angular' } },
      { _id: 'svelte', name: 'Svelte', slug: { current: 'svelte' } },
      { _id: 'next', name: 'Next', slug: { current: 'next' } },
      { _id: 'empty', name: 'Empty', slug: { current: 'empty' } },
      { _id: 'astro', name: 'Astro', slug: { current: 'astro' } },
      { _id: 'remix', name: 'Remix', slug: { current: 'remix' } },
      { _id: 'nuxt', name: 'Nuxt', slug: { current: 'nuxt' } },
    ];

    const counts: Record<string, number> = {
      react: 5,
      vue: 5,
      angular: 3,
      svelte: 1,
      next: 5,
      empty: 0,
      astro: 2,
      remix: 1,
      nuxt: 4,
    };

    vi.mocked(getTagsWithCount).mockResolvedValue({
      tags: tags as never,
      tagCount: (slug?: string) => counts[slug || ''] || 0,
    });

    render(await TopTags());

    const chips = screen.getAllByTestId('tag-chip');
    expect(chips).toHaveLength(7);
    expect(chips.map(chip => chip.textContent)).toEqual([
      '#Next',
      '#React',
      '#Vue',
      '#Nuxt',
      '#Angular',
      '#Astro',
      '#Remix',
    ]);

    expect(screen.queryByText('#Empty')).not.toBeInTheDocument();
    expect(screen.queryByText('#Svelte')).not.toBeInTheDocument();

    expect(screen.getAllByText('5 posts')).toHaveLength(3);
    expect(screen.getByText('4 posts')).toBeInTheDocument();
    expect(screen.getByText('3 posts')).toBeInTheDocument();
    expect(screen.getByText('2 posts')).toBeInTheDocument();
    expect(screen.getByText('1 post')).toBeInTheDocument();
  });

  it('renders nothing when the query returns no tags', async () => {
    vi.mocked(getTagsWithCount).mockResolvedValue({
      tags: undefined,
      tagCount: () => 0,
    });

    render(await TopTags());

    expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
  });
});

describe('TopTagsSkeleton', () => {
  it('renders 7 skeleton placeholders sized 200x32', () => {
    render(<TopTagsSkeleton />);

    const placeholders = screen.getAllByTestId('top-tag-skeleton');
    expect(placeholders).toHaveLength(7);
    for (const node of placeholders) {
      expect(node).toHaveAttribute('data-width', '200');
      expect(node).toHaveAttribute('data-height', '32');
    }
  });
});
