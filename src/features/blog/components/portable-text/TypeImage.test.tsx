import { fireEvent, render, screen } from '@testing-library/react';
import TypeImage from './TypeImage';
import { ArticleImageViewerContext } from '../images/ArticleImageViewerContext';

vi.mock('@/components/ui', () => ({
  Img: ({ alt, className }: { alt?: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test double for Img component
    <img alt={alt} className={className} data-testid="portable-text-image" />
  ),
}));

describe('TypeImage', () => {
  it('passes the original asset and existing image text to the article viewer', () => {
    const openViewer = vi.fn();
    render(
      <ArticleImageViewerContext.Provider value={openViewer}>
        <TypeImage
          value={{
            _type: 'image',
            asset: { _ref: 'image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2400x1200-png' },
            crop: { top: 0.1, bottom: 0.1, left: 0.2, right: 0.2 },
            width: 2400,
            height: 1200,
            caption: 'Photo by Jane',
            alt: 'A mountain',
          }}
        />
      </ArticleImageViewerContext.Provider>,
    );
    const trigger = screen.getByRole('button', { name: 'View image: A mountain' });
    fireEvent.click(trigger);

    expect(openViewer).toHaveBeenCalledWith({
      src: 'https://cdn.sanity.io/images/wdxhl3tc/production/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2400x1200.png?auto=format',
      alt: 'A mountain',
      caption: 'Photo by Jane',
    }, trigger);
    expect(screen.getByTestId('portable-text-image')).toHaveAttribute('alt', 'A mountain');
    expect(screen.getByText('Photo by Jane').tagName).toBe('FIGCAPTION');
  });

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
