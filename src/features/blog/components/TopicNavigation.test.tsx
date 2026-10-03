import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicNavigation from './TopicNavigation';
import { TOPICS } from '@/features/blog/data/topics';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const topics = TOPICS.map(topic => ({ ...topic, postCount: topic.slug.current === 'ai-assisted-development' ? 0 : 1 }));

describe('TopicNavigation', () => {
  it('starts collapsed on topic archives, exposes the current selection and reset, and hides empty topics', () => {
    render(<TopicNavigation topics={topics} activeSlug="architecture" totalPostCount={5} />);

    expect(screen.getByRole('button', { name: 'Browse topics' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'All posts' })).toHaveAttribute('href', '/blog');
    const list = within(screen.getByRole('list'));
    expect(list.getByRole('link', { name: 'Architecture (1)' })).toHaveAttribute('aria-current', 'page');
    expect(list.getByRole('link', { name: 'Architecture (1)' })).toHaveAttribute('href', '/blog/topics/architecture');
    expect(screen.queryByText(/AI-Assisted Development/)).not.toBeInTheDocument();
  });

  it('closes on Escape and restores focus to the toggle', async () => {
    const user = userEvent.setup();
    render(<TopicNavigation topics={topics} totalPostCount={5} />);
    const button = screen.getByRole('button', { name: 'Browse topics' });

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('resets the mobile disclosure after the active topic changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TopicNavigation topics={topics} totalPostCount={5} />);
    await user.click(screen.getByRole('button', { name: 'Browse topics' }));

    rerender(<TopicNavigation topics={topics} activeSlug="performance" totalPostCount={5} />);

    expect(screen.getByRole('button', { name: 'Browse topics' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(screen.getByRole('list')).getByRole('link', { name: 'Performance (1)' })).toHaveAttribute('aria-current', 'page');
  });
});
