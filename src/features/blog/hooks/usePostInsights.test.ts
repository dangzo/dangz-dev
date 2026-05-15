import usePostInsights, { type PortableTextBody } from './usePostInsights';

function makeBlock({
  style = 'normal',
  text = '',
}: {
  style?: string;
  text?: string;
}) {
  return {
    _type: 'block',
    _key: `${style}-${text}`,
    style,
    children: [
      {
        _type: 'span',
        _key: `${style}-${text}-span`,
        text,
      },
    ],
  };
}

describe('usePostInsights', () => {
  describe('extractTocFromBody', () => {
    it('returns an empty toc when body is missing or empty', () => {
      const { extractTocFromBody } = usePostInsights();

      expect(extractTocFromBody()).toEqual([]);
      expect(extractTocFromBody([] as PortableTextBody)).toEqual([]);
    });

    it('extracts only h2 and h3 headings with trimmed titles and proper levels', () => {
      const { extractTocFromBody } = usePostInsights();

      const body = [
        { _type: 'image', _key: 'img-1' },
        makeBlock({ style: 'normal', text: 'Paragraph' }),
        makeBlock({ style: 'h2', text: '  Overview  ' }),
        makeBlock({ style: 'h3', text: 'Setup' }),
        makeBlock({ style: 'h4', text: 'Ignored heading' }),
      ] as unknown as PortableTextBody;

      expect(extractTocFromBody(body)).toEqual([
        { id: 'overview', title: 'Overview', level: 2 },
        { id: 'setup', title: 'Setup', level: 3 },
      ]);
    });

    it('deduplicates heading ids for repeated titles and skips empty heading text', () => {
      const { extractTocFromBody } = usePostInsights();

      const body = [
        makeBlock({ style: 'h2', text: 'Repeat' }),
        makeBlock({ style: 'h3', text: 'Repeat' }),
        makeBlock({ style: 'h2', text: '   ' }),
      ] as unknown as PortableTextBody;

      expect(extractTocFromBody(body)).toEqual([
        { id: 'repeat', title: 'Repeat', level: 2 },
        { id: 'repeat-2', title: 'Repeat', level: 3 },
      ]);
    });
  });

  describe('getReadingTimeMinutes', () => {
    it('returns 1 when body is missing or empty', () => {
      const { getReadingTimeMinutes } = usePostInsights();

      expect(getReadingTimeMinutes()).toBe(1);
      expect(getReadingTimeMinutes([] as PortableTextBody)).toBe(1);
    });

    it('returns 1 for short content and ignores non-block items', () => {
      const { getReadingTimeMinutes } = usePostInsights();

      const body = [
        { _type: 'image', _key: 'img-1' },
        makeBlock({ text: 'one two three four' }),
      ] as unknown as PortableTextBody;

      expect(getReadingTimeMinutes(body)).toBe(1);
    });

    it('rounds up reading time at 220 words per minute', () => {
      const { getReadingTimeMinutes } = usePostInsights();

      const words220 = Array.from({ length: 220 }, (_, i) => `w${i + 1}`).join(' ');
      const words221 = `${words220} extra`;

      const oneMinuteBody = [makeBlock({ text: words220 })] as unknown as PortableTextBody;
      const twoMinuteBody = [makeBlock({ text: words221 })] as unknown as PortableTextBody;

      expect(getReadingTimeMinutes(oneMinuteBody)).toBe(1);
      expect(getReadingTimeMinutes(twoMinuteBody)).toBe(2);
    });
  });
});
