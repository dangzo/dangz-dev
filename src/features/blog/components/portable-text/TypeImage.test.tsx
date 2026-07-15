import { render, screen } from '@testing-library/react';
import TypeImage from './TypeImage';

vi.mock('@/components/ui', () => ({
  Img: ({ alt, className }: { alt?: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test double for Img component
    <img alt={alt} className={className} data-testid="portable-text-image" />
  ),
}));

describe('TypeImage', () => {
  it('renders a caption when provided', () => {
    render(
      <TypeImage
        value={{
          _type: 'image',
          caption: 'Photo by Jane',
          alt: 'A mountain',
        } as never}
      />,
    );

    expect(screen.getByText('Photo by Jane')).toBeInTheDocument();
    expect(screen.getByText('Photo by Jane').tagName).toBe('FIGCAPTION');
  });

  it('omits the caption element when caption is missing', () => {
    const { container } = render(
      <TypeImage
        value={{
          _type: 'image',
          alt: 'A mountain',
        } as never}
      />,
    );

    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('omits the caption element when caption is whitespace only', () => {
    const { container } = render(
      <TypeImage
        value={{
          _type: 'image',
          caption: '   ',
          alt: 'A mountain',
        } as never}
      />,
    );

    expect(container.querySelector('figcaption')).toBeNull();
  });
});