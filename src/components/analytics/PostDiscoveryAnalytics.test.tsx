import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPostOpenedAttributes, trackPostOpened } from '@/utils/postDiscoveryAnalytics';
import PostDiscoveryAnalytics from './PostDiscoveryAnalytics';

vi.mock('@/utils/postDiscoveryAnalytics', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/utils/postDiscoveryAnalytics')>();
  return { ...original, trackPostOpened: vi.fn() };
});

const data = { post_id: 'post-1', source: 'topic', placement: 'cta' } as const;

function renderLink() {
  return render(
    <StrictMode>
      <PostDiscoveryAnalytics />
      <a href="#article" {...getPostOpenedAttributes(data)}>
        Article <span data-testid="nested">→</span>
      </a>
    </StrictMode>,
  );
}

beforeEach(() => {
  vi.mocked(trackPostOpened).mockClear();
});

it.each([
  {}, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true },
])('tracks nested primary activation once without cancelling it: %j', (modifiers) => {
  renderLink();
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...modifiers });
  screen.getByTestId('nested').dispatchEvent(event);
  expect(trackPostOpened).toHaveBeenCalledExactlyOnceWith(data);
  expect(event.defaultPrevented).toBe(false);
});

it('tracks native Enter activation once', async () => {
  const user = userEvent.setup();
  renderLink();
  screen.getByRole('link').focus();
  await user.keyboard('{Enter}');
  expect(trackPostOpened).toHaveBeenCalledExactlyOnceWith(data);
});

it('captures the event before a bubbling navigation handler', () => {
  renderLink();
  const navigate = vi.fn();
  screen.getByRole('link').addEventListener('click', navigate);
  fireEvent.click(screen.getByTestId('nested'));
  expect(vi.mocked(trackPostOpened).mock.invocationCallOrder[0]).toBeLessThan(navigate.mock.invocationCallOrder[0]);
});

it('counts only middle-button auxclick, ignoring duplicate/non-navigation button events', () => {
  renderLink();
  const nested = screen.getByTestId('nested');
  for (const [type, button] of [['click', 1], ['click', 2], ['auxclick', 0], ['auxclick', 2]] as const) {
    nested.dispatchEvent(new MouseEvent(type, { bubbles: true, button }));
  }
  expect(trackPostOpened).not.toHaveBeenCalled();
  const event = new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 });
  nested.dispatchEvent(event);
  expect(trackPostOpened).toHaveBeenCalledExactlyOnceWith(data);
  expect(event.defaultPrevented).toBe(false);
});

it('ignores unmarked links, invalid metadata and non-anchor marks', () => {
  render(
    <>
      <PostDiscoveryAnalytics />
      <a href="#article">Unmarked</a>
      <a href="#article" {...getPostOpenedAttributes(data)} data-post-opened-source="search">Invalid source</a>
      <a href="#article" {...getPostOpenedAttributes(data)} data-post-opened-placement="image">Invalid placement</a>
      <a href="#article" {...getPostOpenedAttributes(data)} data-post-opened-post-id=" ">Missing ID</a>
      <span {...getPostOpenedAttributes(data)}>Non-anchor</span>
    </>,
  );
  for (const text of ['Unmarked', 'Invalid source', 'Invalid placement', 'Missing ID', 'Non-anchor']) {
    fireEvent.click(screen.getByText(text));
  }
  expect(trackPostOpened).not.toHaveBeenCalled();
});

it('cleans up both listeners under Strict Mode and remounting', () => {
  const view = renderLink();
  const link = screen.getByRole('link');
  view.unmount();
  document.body.append(link);
  fireEvent.click(link);
  link.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
  expect(trackPostOpened).not.toHaveBeenCalled();
  const remounted = render(<StrictMode><PostDiscoveryAnalytics /></StrictMode>);
  fireEvent.click(link);
  expect(trackPostOpened).toHaveBeenCalledExactlyOnceWith(data);
  remounted.unmount();
  link.remove();
});
