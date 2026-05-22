import { render, screen } from '@testing-library/react';

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
});