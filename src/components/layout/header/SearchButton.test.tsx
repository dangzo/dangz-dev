import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchButton from './SearchButton';

vi.mock('next/dynamic', async () => {
  const { default: SearchModalBridge } = await import('./SearchModalBridge');
  return {
    default: () => SearchModalBridge,
  };
});

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('SearchButton', () => {
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

  it('exposes dialog semantics on the search control', () => {
    render(<SearchButton />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K');
  });

  it('shows a keyboard shortcut hint under the search button', async () => {
    render(<SearchButton />);

    await waitFor(() => {
      expect(screen.getByText(/^(Ctrl\+K|⌘K)$/)).toBeInTheDocument();
    });
  });

  it('opens the search dialog and sets aria-expanded after the bridge handles the request', async () => {
    const user = userEvent.setup();
    render(<SearchButton />);
    const button = screen.getByRole('button', { name: 'Search' });
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the dialog from Escape and restores aria-expanded', async () => {
    const user = userEvent.setup();
    render(<SearchButton />);
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Search posts' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('increments open requests on subsequent clicks while keeping the dialog mounted', async () => {
    const user = userEvent.setup();
    render(<SearchButton />);
    const button = screen.getByRole('button', { name: 'Search' });
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the search dialog with Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<SearchButton />);
    const button = screen.getByRole('button', { name: 'Search' });

    await user.keyboard('{Control>}k{/Control}');

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the search dialog with Meta+K', async () => {
    const user = userEvent.setup();
    render(<SearchButton />);
    const button = screen.getByRole('button', { name: 'Search' });

    await user.keyboard('{Meta>}k{/Meta}');

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles the search dialog closed with a second Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<SearchButton />);
    const button = screen.getByRole('button', { name: 'Search' });

    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search posts' })).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Search posts' })).not.toBeInTheDocument();
    });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
