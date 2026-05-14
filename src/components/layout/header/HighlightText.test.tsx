import { render, screen } from '@testing-library/react';

import HighlightText from './HighlightText';

describe('HighlightText', () => {
  it('returns plain text when the query has no searchable terms', () => {
    const { container } = render(<HighlightText text="Hello world" query="a" />);
    expect(container.textContent).toBe('Hello world');
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('returns plain text when the text is empty', () => {
    const { container } = render(<HighlightText text="" query="hello" />);
    expect(container.textContent).toBe('');
  });

  it('wraps case-insensitive matches in marks', () => {
    const { container } = render(<HighlightText text="Hello" query="hello" />);
    const mark = container.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark).toHaveTextContent('Hello');
  });

  it('deduplicates repeated query tokens', () => {
    const { container } = render(<HighlightText text="foo" query="foo foo" />);
    expect(container.querySelectorAll('mark')).toHaveLength(1);
  });

  it('escapes regex metacharacters in the query', () => {
    render(<HighlightText text="file.txt" query="file.txt" />);
    expect(screen.getByText('file.txt').tagName).toBe('MARK');
  });

  it('highlights multiple distinct terms', () => {
    render(<HighlightText text="alpha beta" query="alpha beta" />);
    expect(screen.getByText('alpha').tagName).toBe('MARK');
    expect(screen.getByText('beta').tagName).toBe('MARK');
  });
});
