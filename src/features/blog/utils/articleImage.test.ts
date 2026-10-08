import { getArticleImage } from './articleImage';

const source = {
  _type: 'image',
  asset: { _type: 'reference', _ref: 'image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2400x1200-png' },
  crop: { top: 0.1, bottom: 0.2, left: 0.1, right: 0.2 },
  hotspot: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
};

describe('getArticleImage', () => {
  it('resolves an original asset reference without thumbnail resizing or editorial cropping', () => {
    const image = getArticleImage(source, 'An uncropped image', 'Caption');

    expect(image).toEqual({
      src: 'https://cdn.sanity.io/images/wdxhl3tc/production/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2400x1200.png?auto=format',
      alt: 'An uncropped image',
      caption: 'Caption',
    });
  });

  it('resolves cover assets populated with a URL and preserves alternative text verbatim', () => {
    const image = getArticleImage({ asset: { url: 'https://cdn.sanity.io/images/wdxhl3tc/production/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2400x1200.png' } }, ' ');

    expect(image?.src).toContain('2400x1200.png?auto=format');
    expect(image?.alt).toBe(' ');
  });

  it('does not create a descriptor for missing or invalid assets', () => {
    expect(getArticleImage(undefined, 'Missing')).toBeUndefined();
    expect(getArticleImage({ _type: 'image' }, 'Invalid')).toBeUndefined();
    expect(getArticleImage({ asset: { _ref: 'not-an-image' } }, 'Invalid')).toBeUndefined();
  });
});
