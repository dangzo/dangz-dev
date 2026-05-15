import { render, screen } from '@testing-library/react';

import Icon from './Icon';

vi.mock('next/link', () => import('@/test/mocks/nextLink'));

describe('Icon', () => {
  it('renders only the SVG icon when href is not provided', () => {
    render(<Icon icon="github" data-testid="github-icon" />);

    const icon = screen.getByTestId('github-icon');

    expect(icon.tagName).toBe('svg');
    expect(icon).toHaveAttribute('width', '8');
    expect(icon).toHaveAttribute('height', '8');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies custom svg width and height when href is not provided', () => {
    render(<Icon icon="mail" size={10} data-testid="mail-icon" />);

    const icon = screen.getByTestId('mail-icon');

    expect(icon).toHaveAttribute('width', '10');
    expect(icon).toHaveAttribute('height', '10');
  });

  it('renders the icon in an external link with tracking attributes when href is provided', () => {
    render(
      <Icon
        icon="github"
        href="https://github.com/dangz0"
        data-umami-event="GitHub Click"
      />,
    );

    const link = screen.getByRole('link', { name: /github/i });

    expect(link).toHaveAttribute('href', 'https://github.com/dangz0');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('data-umami-event', 'GitHub Click');
  });

  it('applies custom size and classes to the linked svg icon', () => {
    render(
      <Icon
        icon="github"
        href="https://github.com/dangz0"
        size={10}
        className="custom-icon"
        data-testid="linked-icon"
      />,
    );

    const link = screen.getByRole('link', { name: /github/i });
    const icon = screen.getByTestId('linked-icon');

    expect(link).toContainElement(icon);
    expect(icon).toHaveClass('h-10', 'w-10', 'custom-icon');
  });
});
