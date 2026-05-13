import { render, screen } from '@testing-library/react';

import Prompt from './Prompt';

const mockPathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Prompt', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('renders a home link for the root path', () => {
    render(<Prompt />);
    const home = screen.getByRole('link', { name: '~' });
    expect(home).toHaveAttribute('href', '/');
  });

  it('renders breadcrumb links for nested paths', () => {
    mockPathname.mockReturnValue('/blog/post-slug');
    render(<Prompt />);

    expect(screen.getByRole('link', { name: '~' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'blog' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: 'post-slug' })).toHaveAttribute('href', '/blog/post-slug');
  });

  it('shows the shell prompt label for guests', () => {
    render(<Prompt />);
    expect(screen.getByText(/guest@dangz\.dev:/)).toBeInTheDocument();
  });

  it('renders a caret marker after the path', () => {
    render(<Prompt />);
    expect(screen.getByText('|')).toBeInTheDocument();
  });
});
