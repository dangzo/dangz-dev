import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode, type ComponentProps } from 'react';
import ArticleImageViewer from './ArticleImageViewer';
import ArticleImageTrigger from './ArticleImageTrigger';
import type { ArticleImageDescriptor } from './ArticleImageViewerContext';

vi.mock('next/image', () => ({
  default: ({ fill, alt, ...props }: ComponentProps<'img'> & { fill?: boolean }) => {
    void fill;

    return (
      // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
      <img alt={alt} {...props} />
    );
  },
}));

const landscape = {
  src: 'https://cdn.sanity.io/landscape.png',
  alt: 'Landscape',
  caption: 'Original caption',
};

function renderViewer(image: ArticleImageDescriptor = landscape) {
  return render(
    <ArticleImageViewer>
      <ArticleImageTrigger image={image}>
        <span>Thumbnail</span>
      </ArticleImageTrigger>
    </ArticleImageViewer>,
  );
}

function openViewer(name = 'View image: Landscape') {
  const trigger = screen.getByRole('button', { name });
  fireEvent.click(trigger);
  act(() => vi.advanceTimersByTime(40));

  return trigger;
}

function finishClosing() {
  act(() => vi.advanceTimersByTime(240));
}

describe('ArticleImageViewer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('opens a named modal with the original image, alternative text and caption', () => {
    renderViewer();
    openViewer();

    const dialog = screen.getByRole('dialog', { name: 'Image viewer' });
    const image = screen.getByRole('img', { name: 'Landscape' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Original caption');
    expect(image).toHaveAttribute('src', landscape.src);
    expect(image).toHaveAttribute('sizes', expect.stringContaining('100vw'));
    expect(image).toHaveClass('object-contain');
    expect(screen.getByRole('button', { name: 'Close image' })).toHaveFocus();
  });

  it('keeps the background isolated during closing and restores its styles and focus afterward', () => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '3px';
    const { container } = renderViewer();
    const trigger = openViewer();

    expect(container).toHaveAttribute('inert');
    expect(container).toHaveAttribute('aria-hidden', 'true');
    expect(document.body.style.position).toBe('fixed');
    fireEvent.click(screen.getByRole('button', { name: 'Close image' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(container).toHaveAttribute('inert');
    finishClosing();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container).not.toHaveAttribute('inert');
    expect(container).not.toHaveAttribute('aria-hidden');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('3px');
    expect(trigger).toHaveFocus();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('contains keyboard focus, including the scrollable caption', () => {
    renderViewer();
    openViewer();
    const close = screen.getByRole('button', { name: 'Close image' });
    const caption = screen.getByText('Original caption');

    fireEvent.keyDown(close, { key: 'Tab' });
    expect(caption).toHaveFocus();
    fireEvent.keyDown(caption, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(caption).toHaveFocus();
    fireEvent.keyDown(caption, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
  });

  it('redirects escaped focus and suppresses the background search shortcut', () => {
    renderViewer();
    openViewer();
    const backgroundButton = document.createElement('button');
    document.body.append(backgroundButton);
    backgroundButton.focus();
    expect(screen.getByRole('button', { name: 'Close image' })).toHaveFocus();

    const shortcut = vi.fn();
    window.addEventListener('keydown', shortcut);
    fireEvent.keyDown(document.activeElement!, { key: 'k', ctrlKey: true });
    fireEvent.keyDown(document.activeElement!, { key: 'k', metaKey: true });
    expect(shortcut).not.toHaveBeenCalled();
    window.removeEventListener('keydown', shortcut);
    backgroundButton.remove();
  });

  it('dismisses with Escape or backdrop clicks, while image and caption clicks keep it open', () => {
    renderViewer();
    const trigger = openViewer();
    fireEvent.click(screen.getByRole('img'));
    fireEvent.click(screen.getByText('Original caption'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    finishClosing();
    expect(trigger).toHaveFocus();

    openViewer();
    fireEvent.click(screen.getByRole('dialog'));
    finishClosing();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dismisses on the closing transition end without relying on the fallback timer', () => {
    renderViewer();
    openViewer();
    fireEvent.click(screen.getByRole('button', { name: 'Close image' }));
    fireEvent(screen.getByRole('dialog'), new Event('transitionend', { bubbles: true }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const end = new Event('transitionend', { bubbles: true });
    Object.defineProperty(end, 'propertyName', { value: 'opacity' });
    fireEvent(screen.getByRole('dialog'), end);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('omits blank captions and preserves blank alternative text with a useful trigger name', () => {
    renderViewer({ src: landscape.src, alt: ' ', caption: '  ' });
    openViewer('View image: Article image');

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('img')).toHaveAttribute('alt', ' ');
    expect(document.querySelector('figcaption')).not.toBeInTheDocument();
  });

  it('lets readers dismiss loading and failed images', () => {
    renderViewer();
    openViewer();
    expect(screen.getByRole('status')).toHaveTextContent('Loading image');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('status')).toHaveTextContent('Unable to load image');
    fireEvent.click(screen.getByRole('button', { name: 'Close image' }));
    finishClosing();

    openViewer();
    expect(screen.getByRole('status')).toHaveTextContent('Loading image');
    fireEvent.load(screen.getByRole('img'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    finishClosing();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('treats the empty object-contain area as backdrop rather than image content', () => {
    renderViewer();
    openViewer();
    const image = screen.getByRole('img');
    Object.defineProperties(image, {
      naturalWidth: { value: 1200 },
      naturalHeight: { value: 2400 },
    });
    vi.spyOn(image, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}),
    });

    fireEvent.click(image, { clientX: 400, clientY: 300 });
    finishClosing();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(image, { clientX: 50, clientY: 300 });
    finishClosing();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('skips the closing delay for reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    renderViewer();
    openViewer();
    fireEvent.click(screen.getByRole('button', { name: 'Close image' }));
    act(() => vi.advanceTimersByTime(0));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('restores prior background attributes and scroll state on unmount', () => {
    const background = document.createElement('aside');
    background.setAttribute('inert', '');
    background.setAttribute('aria-hidden', 'false');
    document.body.append(background);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(0);
    document.documentElement.style.scrollBehavior = 'smooth';
    const { unmount } = renderViewer();
    openViewer();
    expect(document.body.style.top).toBe('-500px');

    unmount();
    expect(background).toHaveAttribute('inert');
    expect(background).toHaveAttribute('aria-hidden', 'false');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
    expect(document.documentElement.style.scrollBehavior).toBe('smooth');
    expect(document.body.style.position).toBe('');
    document.documentElement.style.scrollBehavior = '';
    background.remove();
  });

  it('cleans up correctly under Strict Mode and when closed before the entry animation', () => {
    render(
      <StrictMode>
        <ArticleImageViewer>
          <ArticleImageTrigger image={landscape}>Thumbnail</ArticleImageTrigger>
        </ArticleImageViewer>
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'View image: Landscape' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    finishClosing();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.position).toBe('');
    expect(screen.getByRole('button', { name: 'View image: Landscape' })).toHaveFocus();
  });

  it('keeps missing sources and images outside the article provider noninteractive', () => {
    const { rerender } = render(<ArticleImageTrigger image={landscape}>Thumbnail</ArticleImageTrigger>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<ArticleImageViewer><ArticleImageTrigger>Thumbnail</ArticleImageTrigger></ArticleImageViewer>);
    expect(screen.getByText('Thumbnail')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
