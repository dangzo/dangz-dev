import { createElement, Fragment } from 'react';

import { createHeadingIdFactory, getNodeText } from './posts';

describe('createHeadingIdFactory', () => {
  it('returns slug-based ids and appends numeric suffixes for duplicates', () => {
    const getHeadingId = createHeadingIdFactory();

    expect(getHeadingId('Hello World')).toBe('hello-world');
    expect(getHeadingId('Hello World')).toBe('hello-world-2');
    expect(getHeadingId('HELLO world')).toBe('hello-world-3');
  });

  it('maintains independent counts per slug base', () => {
    const getHeadingId = createHeadingIdFactory();

    expect(getHeadingId('Alpha')).toBe('alpha');
    expect(getHeadingId('Beta')).toBe('beta');
    expect(getHeadingId('Alpha')).toBe('alpha-2');
    expect(getHeadingId('Beta')).toBe('beta-2');
  });

  it('uses fallback slug and still deduplicates when slugify yields empty content', () => {
    const getHeadingId = createHeadingIdFactory();

    expect(getHeadingId('!!!')).toBe('section');
    expect(getHeadingId('@@@')).toBe('section-2');
  });
});

describe('getNodeText', () => {
  it('returns plain strings and numbers as text', () => {
    expect(getNodeText('hello')).toBe('hello');
    expect(getNodeText(42)).toBe('42');
  });

  it('recursively extracts text from arrays and nested elements', () => {
    const node = [
      'Start ',
      createElement('strong', null, 'Bold'),
      createElement(Fragment, null, [' and ', createElement('em', { key: 'em' }, 'Italic')]),
      ' End',
    ];

    expect(getNodeText(node)).toBe('Start Bold and Italic End');
  });

  it('returns an empty string for unsupported node values', () => {
    expect(getNodeText(null)).toBe('');
    expect(getNodeText(undefined)).toBe('');
    expect(getNodeText(false)).toBe('');
    expect(getNodeText(createElement('div', null))).toBe('');
  });
});
