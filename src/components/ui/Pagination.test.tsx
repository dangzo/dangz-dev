import { render, screen } from '@testing-library/react';

import Pagination from './Pagination';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} basePath="/blog" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('links page 1 to basePath and other pages to basePath/page/N', () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/blog" />);

    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/blog/page/3');
  });

  it('renders the current page as a non-link with aria-current', () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/blog" />);

    expect(screen.queryByRole('link', { name: '2' })).not.toBeInTheDocument();
    const current = screen.getByText('2');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('disables Previous on the first page and Next on the last page', () => {
    const { rerender } = render(<Pagination currentPage={1} totalPages={3} basePath="/blog" />);
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('aria-disabled', 'false');

    rerender(<Pagination currentPage={3} totalPages={3} basePath="/blog" />);
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'false');
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('scopes page links to the given basePath', () => {
    render(<Pagination currentPage={1} totalPages={2} basePath="/blog/tags/react" />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/blog/tags/react/page/2');
  });
});
