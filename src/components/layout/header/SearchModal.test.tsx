import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchModal from './SearchModal';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('SearchModal', () => {
  beforeEach(() => {
    push.mockClear();
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
    expect(screen.queryByRole('dialog', { name: 'Search posts' })).not.toBeInTheDocument();
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
    expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: 'Esc' }));
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
    expect(screen.getByText(/Type at least 2 characters to search posts/)).toBeInTheDocument();
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
    expect(screen.getByText('No results found for "xyz".')).toBeInTheDocument();
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
            tags: [],
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
          { id: '1', slug: 'one', title: 'First', excerpt: '', tags: [] },
          { id: '2', slug: 'two', title: 'Second', excerpt: '', tags: [] },
        ]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/blog/one');
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
          { id: '1', slug: 'one', title: 'First', excerpt: '', tags: [] },
          { id: '2', slug: 'two', title: 'Second', excerpt: '', tags: [] },
        ]}
        isLoading={false}
        inputRef={inputRef}
        onQueryChange={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(push).toHaveBeenCalledWith('/blog/two');
  });
});
