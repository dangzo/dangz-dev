import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import type { UmamiPayload } from '@/utils/umami';

const navigation = vi.hoisted(() => ({ pathname: '/blog/article', search: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

it('records committed routes once under Strict Mode and remounts, including return visits', async () => {
  vi.resetModules();
  window.history.replaceState(null, '', '/blog/article');
  const { default: UmamiPageviews } = await import('./UmamiPageviews');
  const payloads: UmamiPayload[] = [];
  vi.stubGlobal('umami', {
    track: (payload: (defaults: UmamiPayload) => UmamiPayload) => {
      payloads.push(payload({ website: 'fixture' }));
    },
  });

  try {
    const view = render(<StrictMode><UmamiPageviews /></StrictMode>);
    view.rerender(<StrictMode><UmamiPageviews /></StrictMode>);
    view.unmount();
    const remounted = render(<StrictMode><UmamiPageviews /></StrictMode>);
    navigation.pathname = '/blog';
    window.history.replaceState(null, '', navigation.pathname);
    remounted.rerender(<StrictMode><UmamiPageviews /></StrictMode>);
    navigation.pathname = '/blog/article';
    window.history.replaceState(null, '', navigation.pathname);
    remounted.rerender(<StrictMode><UmamiPageviews /></StrictMode>);
    navigation.search = 'source=share+link';
    window.history.replaceState(null, '', `${navigation.pathname}?source=share%20link`);
    remounted.rerender(<StrictMode><UmamiPageviews /></StrictMode>);

    expect(payloads.map(({ url }) => url)).toEqual([
      `${location.origin}/blog/article`, `${location.origin}/blog`,
      `${location.origin}/blog/article`, `${location.origin}/blog/article?source=share%20link`,
    ]);
  } finally {
    vi.unstubAllGlobals();
    navigation.pathname = '/blog/article';
    navigation.search = '';
    window.history.replaceState(null, '', '/');
  }
});
