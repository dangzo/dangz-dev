import { describe, expect, it } from 'vitest';

import { kebabCase, slugify, startCase } from './strings';

describe('slugify', () => {
  it.each([
    { input: 'Hello World', expected: 'hello-world' },
    { input: '  Mixed CASE  ', expected: 'mixed-case' },
    { input: 'foo   bar', expected: 'foo-bar' },
    { input: 'café résumé', expected: 'caf-rsum' },
    { input: 'a!@#b', expected: 'ab' },
    { input: '', expected: 'section' },
    { input: '   ', expected: 'section' },
    { input: '!@#', expected: 'section' },
  ])('$input → $expected', ({ input, expected }) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe('kebabCase', () => {
  it.each([
    { input: 'Foo Bar', expected: 'foo-bar' },
    { input: 'fooBar', expected: 'foobar' },
    { input: '__FOO__BAR__', expected: 'foo-bar' },
    { input: 'already-kebab', expected: 'already-kebab' },
    { input: '  spaced  ', expected: 'spaced' },
    { input: 'a', expected: 'a' },
    { input: '', expected: '' },
  ])('$input → $expected', ({ input, expected }) => {
    expect(kebabCase(input)).toBe(expected);
  });
});

describe('startCase', () => {
  it.each([
    { input: 'hello-world', expected: 'Hello World' },
    { input: 'foo-bar-baz', expected: 'Foo Bar Baz' },
    { input: 'single', expected: 'Single' },
    { input: '', expected: '' },
  ])('$input → $expected', ({ input, expected }) => {
    expect(startCase(input)).toBe(expected);
  });
});
