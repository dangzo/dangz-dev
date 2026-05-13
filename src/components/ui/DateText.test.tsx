import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DateText from './DateText';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DateText', () => {
  it('renders nothing when `date` is missing', () => {
    const { container } = render(<DateText />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a time element with ISO `dateTime` and locale-formatted text', () => {
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('Jun 15, 2024');
    const iso = '2024-06-15T12:00:00.000Z';
    render(<DateText date={iso} />);
    const time = document.querySelector('time');
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', iso);
    expect(time).toHaveTextContent('Jun 15, 2024');
    expect(screen.getByText('Jun 15, 2024').closest('p')).toHaveClass('text-sm');
  });
});
