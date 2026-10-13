import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchModal from './SearchModal';
import { trackSearchResultSelected } from '@/utils/searchAnalytics';

vi.mock('@/utils/searchAnalytics', () => ({ trackSearchResultSelected: vi.fn() }));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const { setTheme, themeState } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  themeState: { resolvedTheme: 'light' },
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ ...themeState, setTheme }),
}));

describe('SearchModal', () => {
  beforeEach(() => {
    setTheme.mockClear();
    themeState.resolvedTheme = 'light';
    vi.mocked(trackSearchResultSelected).mockClear();
  });

  it('renders nothing when the modal is closed', () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen={false}
        query=""
        results={[]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog', { name: 'Search posts and commands' })).not.toBeInTheDocument();
  });

  it('tracks a nested result click exactly once before closing', async () => {
    const onClose = vi.fn();
    const results = [
      { id: 'first', slug: 'first', title: 'First', excerpt: '', primaryTopic: null },
      { id: 'second', slug: 'second', title: 'Second', excerpt: '', primaryTopic: null },
    ];
    render(<SearchModal isOpen query="second" results={results} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={onClose} />);
    await userEvent.setup().click(screen.getByText('Second'));
    expect(trackSearchResultSelected).toHaveBeenCalledExactlyOnceWith(results[1], 1);
    expect(onClose).toHaveBeenCalledOnce();
    expect(vi.mocked(trackSearchResultSelected).mock.invocationCallOrder[0]).toBeLessThan(onClose.mock.invocationCallOrder[0]);
  });

  it.each([0, 1, 2])('handles auxiliary button %i without closing or cancelling navigation', (button) => {
    const onClose = vi.fn();
    const results = [
      { id: 'first', slug: 'first', title: 'First', excerpt: '', primaryTopic: null },
      { id: 'second', slug: 'second', title: 'Second', excerpt: '', primaryTopic: null },
    ];
    render(<SearchModal isOpen query="second" results={results} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={onClose} />);

    const event = new MouseEvent('auxclick', { button, bubbles: true, cancelable: true });
    fireEvent(screen.getByText('Second'), event);

    if (button === 1) {
      expect(trackSearchResultSelected).toHaveBeenCalledExactlyOnceWith(results[1], 1);
    } else {
      expect(trackSearchResultSelected).not.toHaveBeenCalled();
    }

    expect(onClose).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('portals an accessible dialog when open', () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query=""
        results={[]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Search posts and commands' })).toBeInTheDocument();
  });

  it('invokes onClose when the backdrop close control is used', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query=""
        results={[]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Close search' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when the Esc control is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query=""
        results={[]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={onClose}
      />,
    );
    const escControl = screen.getByRole('button', { name: 'Esc', hidden: true });
    expect(escControl).toHaveClass('hidden', 'lg:inline');
    await user.click(escControl);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows guidance when the query is shorter than two characters', () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query="a"
        results={[]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/at least 2 characters to search posts/)).toBeInTheDocument();
  });

  it('shows loading copy while a search is in flight', () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query="ab"
        results={[]}
        isLoading
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows an empty state when there are no hits for a valid query', () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query="  xyz  "
        results={[]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('No posts or commands found for "xyz".')).toBeInTheDocument();
  });

  it('renders result links to the blog slug routes', () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query="hello"
        results={[
          {
            id: '1',
            slug: 'hello-world',
            title: 'Hello world',
            excerpt: '',
            primaryTopic: null,
          },
        ]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('link', { name: 'Hello world' })).toHaveAttribute('href', '/blog/hello-world');
  });

  it('opens the first result route on Enter when results exist', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query="ab"
        results={[
          { id: '1', slug: 'one', title: 'First', excerpt: '', primaryTopic: null },
          { id: '2', slug: 'two', title: 'Second', excerpt: '', primaryTopic: null },
        ]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={onClose}
      />,
    );
    inputRef.current?.focus();
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(trackSearchResultSelected).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ slug: 'one' }), 0);
  });

  it('moves the active result with arrow keys before opening on Enter', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <SearchModal
        isOpen
        query="ab"
        results={[
          { id: '1', slug: 'one', title: 'First', excerpt: '', primaryTopic: null },
          { id: '2', slug: 'two', title: 'Second', excerpt: '', primaryTopic: null },
        ]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={onClose}
      />,
    );
    inputRef.current?.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(trackSearchResultSelected).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ slug: 'two' }), 1);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows commands immediately without a post query', () => {
    render(<SearchModal isOpen query="" results={[]} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Go to Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Go to Post list' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: 'Go to About' })).toHaveAttribute('href', '/about');
    expect(screen.queryByRole('button', { name: 'Use system theme' })).not.toBeInTheDocument();
  });

  it.each(['BLOG', 'posts', 'articles'])('matches the post-list alias %s', (query) => {
    render(<SearchModal isOpen query={query} results={[]} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Go to Post list' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Go to About' })).not.toBeInTheDocument();
  });

  it.each([' CV ', 'resume'])('matches the résumé alias %s', (query) => {
    render(<SearchModal isOpen query={query} results={[]} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('download');
  });

  it('keeps matching commands usable while loading and hides stale posts', async () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen query="about" results={[
      { id: 'stale', slug: 'stale', title: 'Stale post', excerpt: '', primaryTopic: null },
    ]} isLoading inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={onClose} />);
    expect(screen.queryByRole('link', { name: 'Stale post' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('link', { name: 'Go to About' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(trackSearchResultSelected).not.toHaveBeenCalled();
  });

  it.each([['light', 'dark'], ['dark', 'light']])('toggles resolved %s theme to %s', async (resolvedTheme, targetTheme) => {
    themeState.resolvedTheme = resolvedTheme;
    const onClose = vi.fn();
    render(<SearchModal isOpen query="" results={[]} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={onClose} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Toggle light/dark theme' }));
    expect(setTheme).toHaveBeenCalledExactlyOnceWith(targetTheme);
    expect(onClose).toHaveBeenCalledOnce();
    expect(trackSearchResultSelected).not.toHaveBeenCalled();
  });

  it('preserves contact destinations and palette analytics attributes', () => {
    render(<SearchModal isOpen query="" results={[]} isLoading={false}
      inputRef={createRef<HTMLInputElement>()} onQueryChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
    for (const label of ['View GitHub', 'Connect on LinkedIn']) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link).toHaveAttribute('data-umami-event-placement', 'command_palette');
    }
    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('data-umami-event', 'resume_download_clicked');
  });

  it('resumes typing at the saved selection without losing later characters', async () => {
    const inputRef = createRef<HTMLInputElement>();
    const ControlledSearch = () => {
      const [query, setQuery] = useState('about');
      return (
        <SearchModal isOpen query={query} results={[]} isLoading={false}
          inputRef={inputRef} onQueryChange={setQuery} onClose={vi.fn()} />
      );
    };
    render(<ControlledSearch />);
    const input = screen.getByRole('textbox');
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(1, 3);
    screen.getByRole('link', { name: 'Go to About' }).focus();
    await userEvent.setup().keyboard('Xyz');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('aXyzut');
    expect(inputRef.current?.selectionStart).toBe(4);
  });

  it('moves focus from the input through command rows with arrow keys', async () => {
    const inputRef = createRef<HTMLInputElement>();
    const props = {
      isOpen: true, query: '', results: [], isLoading: false, inputRef,
      onQueryChange: vi.fn(), onClose: vi.fn(),
    };
    const { rerender } = render(<SearchModal {...props} />);
    inputRef.current?.focus();
    const user = userEvent.setup();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Connect on LinkedIn' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveFocus();
    inputRef.current?.focus();
    rerender(<SearchModal {...props} query="about" />);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Go to About' })).toHaveFocus();
  });

});
