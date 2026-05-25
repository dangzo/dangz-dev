import { render, screen } from '@testing-library/react';

import TagChip from './TagChip';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('TagChip', () => {
  it('renders a hash-prefixed label linking to the tag slug under /blog/tags', async () => {
    const ui = await TagChip({
      _id: 'tag-1',
      _type: 'tag',
      _createdAt: '',
      _updatedAt: '',
      _rev: '',
      name: 'React',
      slug: { _type: 'slug', current: 'react' },
    });

    render(ui);

    const link = screen.getByRole('link', { name: '#React' });
    expect(link).toHaveAttribute('href', '/blog/tags/react');
  });
});
