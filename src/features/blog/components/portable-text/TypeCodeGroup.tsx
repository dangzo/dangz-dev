import TabbedCodeBlock from '@/components/ui/TabbedCodeBlock';
import { highlightCodeWithShiki } from '@/features/blog/utils/shikiHighlighter';
import type { CodeGroup } from '@/types/sanity.types';

export default async function TypeCodeGroup({ value }: Readonly<{ value: CodeGroup }>) {
  const variants = await Promise.all((value.variants ?? []).flatMap((variant) => {
    const code = variant.snippet?.code;
    const label = variant.label?.trim();

    if (!label || typeof code !== 'string' || !code.trim()) {
      return [];
    }

    return [(async () => {
      const highlighted = await highlightCodeWithShiki(code, variant.snippet?.language);

      return {
        key: variant._key,
        label,
        value: { code, language: highlighted.language, highlightedHtml: highlighted.html },
      };
    })()];
  }));

  return (
    <TabbedCodeBlock variants={variants} />
  );
}
