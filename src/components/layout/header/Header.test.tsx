import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header from './Header';

const themeMock = vi.hoisted(() => {
  let theme = 'light';
  let resolvedTheme = 'light';
  const setTheme = vi.fn((value: string) => {
    theme = value;
    resolvedTheme = value;
  });
  return {
    setTheme,
    reset() {
      theme = 'light';
      resolvedTheme = 'light';
      setTheme.mockClear();
    },
    useTheme() {
      return {
        get theme() {
          return theme;
        },
        get resolvedTheme() {
          return resolvedTheme;
        },
        setTheme,
      };
    },
  };
});

vi.mock('next-themes', () => ({
  useTheme: () => themeMock.useTheme(),
}));

vi.mock('next/dynamic', async () => {
  const { default: SearchModalBridge } = await import('./SearchModalBridge');
  return {
    default: () => SearchModalBridge,
  };
});

const mockPathname = vi.fn(() => '/');

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push }),
}));

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('Header', () => {
  beforeEach(() => {
    themeMock.reset();
    mockPathname.mockReturnValue('/');
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

  it('renders navigation links for each configured header item', () => {
    render(<Header />);

    for (const title of ['Home', 'Blog', 'About']) {
      const links = screen.getAllByRole('link', { name: title });
      expect(links.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('exposes a hamburger control that toggles the mobile menu state', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle navigation menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-nav-menu')).toBeInTheDocument();

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('includes search and theme controls in the action cluster', async () => {
    render(<Header />);

    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    const themeButton = screen.getByRole('button', { name: 'Theme switcher' });
    expect(themeButton).toBeInTheDocument();
    await waitFor(() => {
      expect(themeButton.querySelector('path[fill-rule="evenodd"]')).toBeInTheDocument();
    });
  });

  it('renders the shell-style path prompt', () => {
    render(<Header />);
    expect(screen.getByText(/guest@dangz\.dev:/)).toBeInTheDocument();
  });
});
