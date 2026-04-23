import CodeBlock, { type CodeBlockProps } from '@/components/ui/CodeBlock';

interface TypeCodeProps {
  value: CodeBlockProps['value'];
}

export default function TypeCode({ value }: TypeCodeProps) {
  return <CodeBlock value={value} />;
}
