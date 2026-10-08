import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HeadingAnchor from './HeadingAnchor';
import { trackHeadingLinkCopied } from '@/features/blog/utils/articleAnalytics';

vi.mock('@/features/blog/utils/articleAnalytics', () => ({ trackHeadingLinkCopied: vi.fn() }));

describe('HeadingAnchor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
  });

  it('copies the current page URL with the heading fragment', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    window.history.replaceState({}, '', '/blog/example?source=share#previous-section');

    render(<HeadingAnchor postId="post-1" id="new-section" />);

    await user.click(screen.getByRole('button', { name: 'Copy link to this section' }));

    expect(trackHeadingLinkCopied).toHaveBeenCalledExactlyOnceWith(
      { post_id: 'post-1', section_id: 'new-section' },
      expect.objectContaining({ url: '/blog/example' }),
    );
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/blog/example?source=share#new-section`);
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument();
  });

  it('does not show copied feedback when the clipboard write fails', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard access denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<HeadingAnchor postId="post-1" id="section" />);

    await user.click(screen.getByRole('button', { name: 'Copy link to this section' }));

    expect(trackHeadingLinkCopied).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Copy link to this section' })).toBeInTheDocument();
  });

  it('waits for clipboard success and keeps the activation context across navigation', async () => {
    const user = userEvent.setup();
    let resolveWrite: (() => void) | undefined;
    const writeText = vi.fn(() => new Promise<void>((resolve) => {
      resolveWrite = resolve;
    }));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    window.history.replaceState({}, '', '/blog/original?private=value#previous');
    render(<HeadingAnchor postId="post-1" id="section" />);

    await user.click(screen.getByRole('button'));
    expect(trackHeadingLinkCopied).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAccessibleName('Copy link to this section');
    window.history.replaceState({}, '', '/blog/later');
    await act(async () => {
      resolveWrite?.();
    });

    expect(trackHeadingLinkCopied).toHaveBeenCalledExactlyOnceWith(
      { post_id: 'post-1', section_id: 'section' },
      expect.objectContaining({ url: '/blog/original' }),
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Link copied');
  });

  it('counts each successful copy independently while feedback is visible', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(<HeadingAnchor postId="post-1" id="section" />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));

    expect(trackHeadingLinkCopied).toHaveBeenCalledTimes(2);
  });

  it('emits nothing when the clipboard API is unavailable', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('navigator', {});
    render(<HeadingAnchor postId="post-1" id="section" />);

    await user.click(screen.getByRole('button'));

    expect(trackHeadingLinkCopied).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAccessibleName('Copy link to this section');
  });
});
