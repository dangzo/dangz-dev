import { clsx } from 'clsx';
import { Text } from '@/components/ui';
import usePostInsights, { type PortableTextBlock} from '@/hooks/usePostInsights';

interface ReadingTimeTextProps extends React.HTMLAttributes<HTMLElement> {
  date?: string;
  postBody?: PortableTextBlock[];
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
