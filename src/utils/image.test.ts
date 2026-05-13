import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockImage } = vi.hoisted(() => ({
  mockImage: vi.fn((source: unknown) => ({ mocked: true, source })),
}));

vi.mock('@sanity/image-url', () => ({
  createImageUrlBuilder: vi.fn(() => ({
    image: mockImage,
  })),
}));

import { createImageUrlBuilder } from '@sanity/image-url';

import { urlFor } from './image';

describe('urlFor', () => {
  beforeEach(() => {
    mockImage.mockClear();
    vi.mocked(createImageUrlBuilder).mockClear();
  });

  it('returns undefined when source is undefined', () => {
    expect(urlFor(undefined)).toBeUndefined();
    expect(mockImage).not.toHaveBeenCalled();
  });

  it('delegates to builder.image with the source when provided', () => {
    const source = { _type: 'image', asset: { _ref: 'image-abc' } };
    const result = urlFor(source);

    expect(mockImage).toHaveBeenCalledTimes(1);
    expect(mockImage).toHaveBeenCalledWith(source);
    expect(result).toEqual({ mocked: true, source });
  });
});
