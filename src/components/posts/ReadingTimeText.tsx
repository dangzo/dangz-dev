import { clsx } from 'clsx';
import { Text } from '@/components/ui';
import usePostInsights from '@/hooks/usePostInsights';

interface ReadingTimeTextProps extends React.HTMLAttributes<HTMLElement> {
  date?: string;
  postBody?: unknown[] | undefined;
}

function ReadingTimeText({ className, postBody }: ReadingTimeTextProps) {
  const { readingTimeMinutes } = usePostInsights({ body: postBody } as never);

  return (
    <Text size="small" className={clsx('italic', className)}>
      {readingTimeMinutes} min read
    </Text>
  );
}

export default ReadingTimeText;
