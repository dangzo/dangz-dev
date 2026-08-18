import { getTotalPages, parsePageParam, PAGE_SIZE } from './pagination';

describe('parsePageParam', () => {
  it('accepts canonical positive integer strings', () => {
    expect(parsePageParam('1')).toBe(1);
    expect(parsePageParam('42')).toBe(42);
  });

  it('rejects non-canonical or invalid values', () => {
    expect(parsePageParam('0')).toBeNull();
    expect(parsePageParam('-1')).toBeNull();
    expect(parsePageParam('01')).toBeNull();
    expect(parsePageParam('1.5')).toBeNull();
    expect(parsePageParam('1e1')).toBeNull();
    expect(parsePageParam('abc')).toBeNull();
    expect(parsePageParam('')).toBeNull();
  });
});

describe('getTotalPages', () => {
  it('rounds up to the nearest full page', () => {
    expect(getTotalPages(13, 12)).toBe(2);
    expect(getTotalPages(24, 12)).toBe(2);
    expect(getTotalPages(25, 12)).toBe(3);
  });

  it('defaults to PAGE_SIZE when no pageSize is given', () => {
    expect(getTotalPages(PAGE_SIZE + 1)).toBe(2);
  });

  it('never returns fewer than 1 page, even for a zero count', () => {
    expect(getTotalPages(0, 12)).toBe(1);
  });
});
