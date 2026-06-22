import CodeBlock from '@/components/ui/CodeBlock';
import { highlightCodeWithShiki } from '@/features/blog/utils/shikiHighlighter';

interface TypeCodeProps {
  value: {
    code: string;
    language: string;
  };
}

export default async function TypeCode({ value }: TypeCodeProps) {
  const highlightedCode = await highlightCodeWithShiki(value.code, value.language);

  return (
    <CodeBlock
      value={{
        code: value.code,
        language: highlightedCode.language,
        highlightedHtml: highlightedCode.html,
      }}
    />
  );
}
