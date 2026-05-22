import { render, screen } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop', () => {
  it('renders as a link with the expected accessible name and href', () => {
    render(<ScrollToTop />);

    const link = screen.getByRole('link', { name: 'ScrollToTop' });
    expect(link).toHaveAttribute('href', '#');
    expect(link).toHaveTextContent('ScrollToTop ↑');
  });
});