import { render, screen } from '@testing-library/react';

import Emoji from './Emoji';

describe('Emoji', () => {
  it('renders an accessible emoji when label is provided', () => {
    render(<Emoji emoji="🔥" label="fire" />);

    const emoji = screen.getByRole('img', { name: 'fire' });
    expect(emoji).toBeInTheDocument();
    expect(emoji).toHaveTextContent('🔥');
    expect(emoji).toHaveAttribute('aria-label', 'fire');
    expect(emoji).toHaveAttribute('aria-hidden', 'false');
  });

  it('hides the emoji from assistive tech when no label is provided', () => {
    const { container } = render(<Emoji emoji="👍" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const emoji = container.querySelector('span');
    expect(emoji).toHaveTextContent('👍');
    expect(emoji).toHaveAttribute('aria-hidden', 'true');
    expect(emoji).not.toHaveAttribute('aria-label');
  });
});