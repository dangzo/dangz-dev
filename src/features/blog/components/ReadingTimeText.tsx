import { clsx } from 'clsx';
import { Text } from '@/components/ui';
import usePostInsights, { type PortableTextBody } from '@/features/blog/hooks/usePostInsights';

interface ReadingTimeTextProps extends React.HTMLAttributes<HTMLElement> {
  date?: string;
  postBody?: PortableTextBody;
}

function ReadingTimeText({ className, postBody }: ReadingTimeTextProps) {
  const { getReadingTimeMinutes } = usePostInsights();

  return (
    <Text size="small" className={clsx('italic', className)}>
      {getReadingTimeMinutes(postBody)} min read
    </Text>
  );
}

export default ReadingTimeText;
