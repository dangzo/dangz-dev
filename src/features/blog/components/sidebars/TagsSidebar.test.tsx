import { render, screen } from '@testing-library/react';

import TagsSidebar from './TagsSidebar';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('TagsSidebar', () => {
  it('renders the tags content inside a styled mobile toggle card with a header', () => {
    render(
      <TagsSidebar
        tags={[
          {
            _id: 'tag-1',
            name: 'React',
            slug: { _key: 'react', current: 'react' },
          },
        ] as any}
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
        tags={[
          {
            _id: 'tag-1',
            name: 'React',
            slug: { _key: 'react', current: 'react' },
          },
          {
            _id: 'tag-2',
            name: 'Next',
            slug: { _key: 'next', current: 'next' },
          },
        ] as any}
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
