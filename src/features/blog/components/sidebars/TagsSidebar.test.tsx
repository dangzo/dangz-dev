import { render, screen } from '@testing-library/react';

import type { Tag } from '@/types/sanity.types';
import TagsSidebar from './TagsSidebar';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const reactTag: Tag = {
  _id: 'tag-1',
  _type: 'tag',
  _createdAt: '',
  _updatedAt: '',
  _rev: '',
  name: 'React',
  slug: { _type: 'slug', current: 'react' },
};

const nextTag: Tag = {
  _id: 'tag-2',
  _type: 'tag',
  _createdAt: '',
  _updatedAt: '',
  _rev: '',
  name: 'Next',
  slug: { _type: 'slug', current: 'next' },
};

describe('TagsSidebar', () => {
  it('renders the tags content inside a styled mobile toggle card with a header', () => {
    render(
      <TagsSidebar
        tags={[reactTag]}
        tagCount={() => 1}
      />,
    );

    const button = screen.getByRole('button');
    const card = button.closest('section');

    expect(screen.getAllByRole('heading', { name: 'All tags' }).length).toBeGreaterThan(0);
    expect(button).toHaveTextContent('Show all tags');
    expect(screen.getByText('All posts (1)')).toBeInTheDocument();
    expect(card?.className).toContain('rounded-xl');
    expect(button.className).toContain('rounded-lg');
  });

  it('opens by default and highlights the active tag on tag pages', () => {
    render(
      <TagsSidebar
        activeSlug="react"
        tags={[reactTag, nextTag]}
        tagCount={() => 1}
      />,
    );

    const button = screen.getByRole('button');
    const activeTag = screen.getByText('REACT (1)');

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(activeTag).toHaveAttribute('aria-current', 'page');
    expect(activeTag.className).toContain('bg-primary-50/50');
  });
});
