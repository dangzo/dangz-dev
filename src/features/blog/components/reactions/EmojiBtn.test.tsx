import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EmojiBtn from './EmojiBtn';

describe('EmojiBtn', () => {
  it('renders a button with an accessible name', () => {
    render(<EmojiBtn emoji="🔥" name="Fire" />);

    const button = screen.getByRole('button', { name: 'Fire' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders the emoji using the provided value and label', () => {
    render(<EmojiBtn emoji="❤️" name="Love" />);

    const emoji = screen.getByRole('img', { name: 'Love' });
    expect(emoji).toBeInTheDocument();
    expect(emoji).toHaveTextContent('❤️');
  });

  it('invokes onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<EmojiBtn emoji="🔥" name="Fire" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Fire' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    render(<EmojiBtn emoji="🔥" name="Fire" disabled />);

    expect(screen.getByRole('button', { name: 'Fire' })).toBeDisabled();
  });
});