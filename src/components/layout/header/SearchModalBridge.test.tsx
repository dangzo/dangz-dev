import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchModalBridge from './SearchModalBridge';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('SearchModalBridge', () => {
  beforeEach(() => {
    push.mockClear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the search modal when the open request counter is positive on mount', async () => {
    const onOpenChange = vi.fn();
    render(
      <SearchModalBridge openRequest={1} closeRequest={0} onOpenChange={onOpenChange} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('opens the modal after the open request prop increases', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SearchModalBridge openRequest={0} closeRequest={0} onOpenChange={onOpenChange} />,
    );

    expect(screen.queryByRole('dialog', { name: 'Search posts' })).not.toBeInTheDocument();

    rerender(
      <SearchModalBridge openRequest={1} closeRequest={0} onOpenChange={onOpenChange} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
  });

  it('closes the modal when the close request prop increases', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SearchModalBridge openRequest={1} closeRequest={0} onOpenChange={onOpenChange} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });

    onOpenChange.mockClear();
    rerender(
      <SearchModalBridge openRequest={1} closeRequest={1} onOpenChange={onOpenChange} />,
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Search posts' })).not.toBeInTheDocument();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('notifies consumers when the modal closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <SearchModalBridge openRequest={1} closeRequest={0} onOpenChange={onOpenChange} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });

    onOpenChange.mockClear();
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Search posts' })).not.toBeInTheDocument();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});