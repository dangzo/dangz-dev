import { render, screen } from '@testing-library/react';

import Img from './Img';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...rest
  }: React.ComponentProps<'img'> & { width?: number; height?: number }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    <img src={String(src)} alt={alt} width={width} height={height} data-testid="next-image" {...rest} />
  ),
}));

const urlFor = vi.fn();

vi.mock('@/hooks/useSanityImageUrl', () => ({
  default: () => ({ urlFor }),
}));

describe('Img', () => {
  beforeEach(() => {
    urlFor.mockReset();
  });

  it('returns null when the Sanity image URL cannot be resolved', () => {
    urlFor.mockReturnValue(undefined);

    const { container } = render(
      <Img source={{ _type: 'reference', _ref: 'missing' } as never} width={400} height={300} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('passes the built URL and dimensions through to next/image', () => {
    const width = vi.fn().mockReturnValue({
      auto: vi.fn().mockReturnValue({
        url: vi.fn(() => 'https://cdn.example/asset.jpg'),
      }),
    });
    urlFor.mockReturnValue({ width });

    render(
      <Img
        source={{ _type: 'reference', _ref: 'image-1' } as never}
        width={640}
        height={480}
        alt="Hero"
      />,
    );

    expect(urlFor).toHaveBeenCalled();
    expect(width).toHaveBeenCalledWith(640);

    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('src', 'https://cdn.example/asset.jpg');
    expect(img).toHaveAttribute('alt', 'Hero');
    expect(img).toHaveAttribute('width', '640');
    expect(img).toHaveAttribute('height', '480');
  });

  it('falls back to a generic alt when alt is omitted', () => {
    urlFor.mockReturnValue({
      width: () => ({
        auto: () => ({
          url: () => 'https://cdn.example/asset.jpg',
        }),
      }),
    });

    render(<Img source={{ _type: 'reference', _ref: 'image-2' } as never} width={100} height={100} />);

    expect(screen.getByTestId('next-image')).toHaveAttribute('alt', '(Image)');
  });
});
