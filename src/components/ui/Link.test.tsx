import { render, screen } from '@testing-library/react';

import Link from './Link';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('Link', () => {
  it('renders a span instead of a link when `isActive` is true', () => {
    render(
      <Link href="/blog" isActive>
        Current
      </Link>,
    );
    const current = screen.getByText('Current');
    expect(current.tagName).toBe('SPAN');
    expect(screen.queryByRole('link', { name: 'Current' })).not.toBeInTheDocument();
  });

  it('renders an internal route with NextLink when `href` starts with `/`', () => {
    render(<Link href="/posts/hello">Read</Link>);
    const link = screen.getByRole('link', { name: 'Read' });
    expect(link).toHaveAttribute('href', '/posts/hello');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders in-page hash targets without forcing a new tab', () => {
    render(<Link href="#section">Jump</Link>);
    const link = screen.getByRole('link', { name: 'Jump' });
    expect(link).toHaveAttribute('href', '#section');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens absolute URLs in a new tab with noopener noreferrer', () => {
    render(<Link href="https://example.com/doc">External</Link>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('href', 'https://example.com/doc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
