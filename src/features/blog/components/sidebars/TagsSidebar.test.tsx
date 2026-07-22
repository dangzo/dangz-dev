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

    expect(screen.getAllByRole('heading', { name: 'Tags' }).length).toBeGreaterThan(0);
    expect(card?.className).toContain('rounded-xl');
    expect(button.className).toContain('rounded-lg');
  });
});
