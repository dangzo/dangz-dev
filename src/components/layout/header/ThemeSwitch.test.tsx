import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ThemeSwitch from './ThemeSwitch';

const themeMock = vi.hoisted(() => {
  let theme = 'light';
  let resolvedTheme = 'light';
  const setTheme = vi.fn((value: string) => {
    theme = value;
    resolvedTheme = value;
  });
  return {
    setTheme,
    setSession(nextTheme: string, nextResolved?: string) {
      theme = nextTheme;
      resolvedTheme = nextResolved ?? nextTheme;
    },
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

describe('ThemeSwitch', () => {
  beforeEach(() => {
    themeMock.reset();
  });

  it('exposes an accessible name on the control', () => {
    render(<ThemeSwitch />);
    expect(screen.getByRole('button', { name: 'Theme switcher' })).toBeInTheDocument();
  });

  it('swaps the placeholder for sun and moon icons after mount', async () => {
    render(<ThemeSwitch />);
    const button = screen.getByRole('button', { name: 'Theme switcher' });
    await waitFor(() => {
      expect(button.querySelector('path[fill-rule="evenodd"]')).toBeInTheDocument();
    });
    expect(button.querySelector('path[d^="M17.293"]')).toBeInTheDocument();
  });

  it('shows the sun layer when resolved theme is light', async () => {
    const { container } = render(<ThemeSwitch />);
    const button = screen.getByRole('button', { name: 'Theme switcher' });
    await waitFor(() => expect(button.querySelector('path[fill-rule="evenodd"]')).toBeInTheDocument());

    const layers = container.querySelectorAll('button .absolute');
    expect(layers[0]).toHaveClass('opacity-100');
    expect(layers[1]).toHaveClass('opacity-0');
  });

  it('requests dark mode while the logical theme is light', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Theme switcher' }).querySelector('path[fill-rule="evenodd"]')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Theme switcher' }));
    expect(themeMock.setTheme).toHaveBeenCalledWith('dark');
  });

  it('requests light mode when the logical theme is dark', async () => {
    const user = userEvent.setup();
    themeMock.setSession('dark');
    render(<ThemeSwitch />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Theme switcher' }).querySelector('path[d^="M17.293"]')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Theme switcher' }));
    expect(themeMock.setTheme).toHaveBeenCalledWith('light');
  });

  it('favors the moon layer when resolved theme is dark', async () => {
    themeMock.setSession('dark');
    const { container } = render(<ThemeSwitch />);
    const button = screen.getByRole('button', { name: 'Theme switcher' });
    await waitFor(() => expect(button.querySelector('path[d^="M17.293"]')).toBeInTheDocument());

    const layers = container.querySelectorAll('button .absolute');
    expect(layers[0]).toHaveClass('opacity-0');
    expect(layers[1]).toHaveClass('opacity-100');
  });
});
