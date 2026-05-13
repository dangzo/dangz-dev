import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Text from './Text';

describe('Text', () => {
  it('renders children in the document', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('uses the small typography scale when size is small', () => {
    render(<Text size="small">Note</Text>);
    const el = screen.getByText('Note');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text-sm');
  });
});
