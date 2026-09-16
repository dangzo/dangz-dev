import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HeadingAnchor from './HeadingAnchor';

describe('HeadingAnchor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
  });

  it('copies the current page URL with the heading fragment', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    window.history.replaceState({}, '', '/blog/example?source=share#previous-section');

    render(<HeadingAnchor id="new-section" />);

    await user.click(screen.getByRole('button', { name: 'Copy link to this section' }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/blog/example?source=share#new-section`);
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument();
  });

  it('does not show copied feedback when the clipboard write fails', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard access denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<HeadingAnchor id="section" />);

    await user.click(screen.getByRole('button', { name: 'Copy link to this section' }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Copy link to this section' })).toBeInTheDocument();
  });
});
