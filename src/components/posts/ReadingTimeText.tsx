import { clsx } from 'clsx';
import { Text } from '@/components/ui';
import { estimateReadingTimeMinutes } from '@/lib/postToc';

interface ReadingTimeTextProps extends React.HTMLAttributes<HTMLElement> {
  date?: string;
  postBody?: unknown[] | undefined;
}

function ReadingTimeText({ className, postBody }: ReadingTimeTextProps) {
  const readingTimeMinutes = estimateReadingTimeMinutes(postBody as never[] | undefined);

  return (
    <Text size="small" className={clsx('italic', className)}>
      {readingTimeMinutes} min read
    </Text>
  );
}

export default ReadingTimeText;
