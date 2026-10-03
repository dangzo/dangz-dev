import { render, screen } from '@testing-library/react';

import type { TopicWithCount } from '@/features/blog/types/Topic.types';
import TagsSidebar from './TagsSidebar';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const architectureTopic: TopicWithCount = {
  _id: 'tag-1',
  description: '',
  postCount: 1,
  displayName: 'Architecture',
  slug: { current: 'architecture' },
};

const performanceTopic: TopicWithCount = {
  _id: 'tag-2',
  description: '',
  postCount: 1,
  displayName: 'Performance',
  slug: { current: 'performance' },
};

describe('TagsSidebar', () => {
  it('renders the topics content inside a styled mobile toggle card with a header', () => {
    render(
      <TagsSidebar
        topics={[architectureTopic]}
        totalPostCount={1}
      />,
    );

    const button = screen.getByRole('button');
    const card = button.closest('section');

    expect(screen.getAllByRole('heading', { name: 'All topics' }).length).toBeGreaterThan(0);
    expect(button).toHaveTextContent('Show all topics');
    expect(screen.getByText('All posts (1)')).toBeInTheDocument();
    expect(card?.className).toContain('rounded-xl');
    expect(button.className).toContain('rounded-lg');
  });

  it('opens by default and highlights the active topic on topic pages', () => {
    render(
      <TagsSidebar
        activeSlug="architecture"
        topics={[architectureTopic, performanceTopic]}
        totalPostCount={1}
      />,
    );

    const button = screen.getByRole('button');
    const activeTag = screen.getByText('ARCHITECTURE (1)');

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(activeTag).toHaveAttribute('aria-current', 'page');
    expect(activeTag).toHaveAttribute('href', '/blog/topics/architecture');
    expect(activeTag.className).toContain('bg-primary-50/50');
  });
});
