import { renderHook } from '@testing-library/react';

import { urlFor } from '@/utils/image';
import useSanityImageUrl from './useSanityImageUrl';

describe('useSanityImageUrl', () => {
  it('exposes the same urlFor helper as the image util module', () => {
    const { result } = renderHook(() => useSanityImageUrl());

    expect(result.current.urlFor).toBe(urlFor);
  });
});
