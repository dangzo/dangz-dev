import { render, screen } from '@testing-library/react';

import Heading from './Heading';

describe('Heading', () => {
  it('renders an h1 by default with the provided children', () => {
    render(<Heading>Page title</Heading>);

    const heading = screen.getByRole('heading', { level: 1, name: 'Page title' });
    expect(heading.tagName).toBe('H1');
  });

  it('renders the requested heading level via the `as` prop', () => {
    render(
      <Heading as="h3" id="section-a">
        Section A
      </Heading>,
    );

    const heading = screen.getByRole('heading', { level: 3, name: 'Section A' });
    expect(heading.tagName).toBe('H3');
    expect(heading).toHaveAttribute('id', 'section-a');
  });

  it('merges custom className with typography presets', () => {
    render(
      <Heading as="h2" className="custom-heading">
        Subtitle
      </Heading>,
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('custom-heading');
    expect(heading.className).toContain('font-heading');
  });
});
