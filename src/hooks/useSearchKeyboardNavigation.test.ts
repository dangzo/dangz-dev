import { act, renderHook } from '@testing-library/react';

import type { SearchHit } from '@/features/blog/hooks/useBlogSearch';
import { useSearchKeyboardNavigation } from './useSearchKeyboardNavigation';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const results: SearchHit[] = [
  { id: '1', slug: 'alpha', title: 'Alpha', excerpt: '', tags: [] },
  { id: '2', slug: 'beta', title: 'Beta', excerpt: '', tags: [] },
];

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('useSearchKeyboardNavigation', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it('keeps activeResultIndex at -1 until keyboard navigation selects a row', () => {
    const { result } = renderHook(() =>
      useSearchKeyboardNavigation({
        isOpen: true,
        results,
        onClose: vi.fn(),
      }),
    );

    expect(result.current.activeResultIndex).toBe(-1);
  });

  it('does not register navigation when the modal is closed', () => {
    const onClose = vi.fn();
    const { result, rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) =>
        useSearchKeyboardNavigation({
          isOpen,
          results,
          onClose,
        }),
      { initialProps: { isOpen: false } },
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    expect(result.current.activeResultIndex).toBe(-1);

    rerender({ isOpen: true });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    expect(result.current.activeResultIndex).toBe(0);
  });

  it('wraps ArrowDown and ArrowUp across the result list', () => {
    const { result } = renderHook(() =>
      useSearchKeyboardNavigation({
        isOpen: true,
        results,
        onClose: vi.fn(),
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(result.current.activeResultIndex).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(result.current.activeResultIndex).toBe(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(result.current.activeResultIndex).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    });
    expect(result.current.activeResultIndex).toBe(1);
  });

  it('selects the last item when ArrowUp is pressed with no prior selection', () => {
    const { result } = renderHook(() =>
      useSearchKeyboardNavigation({
        isOpen: true,
        results,
        onClose: vi.fn(),
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    });

    expect(result.current.activeResultIndex).toBe(1);
  });

  it('ignores arrow keys when there are no results', () => {
    const { result } = renderHook(() =>
      useSearchKeyboardNavigation({
        isOpen: true,
        results: [],
        onClose: vi.fn(),
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    expect(result.current.activeResultIndex).toBe(-1);
  });

  it('navigates to the first hit on Enter when nothing is highlighted', () => {
    const onClose = vi.fn();
    renderHook(() =>
      useSearchKeyboardNavigation({
        isOpen: true,
        results,
        onClose,
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/blog/alpha');
  });

  it('navigates to the highlighted hit on Enter', () => {
    const onClose = vi.fn();
    renderHook(() =>
      useSearchKeyboardNavigation({
        isOpen: true,
        results,
        onClose,
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/blog/beta');
  });
});
