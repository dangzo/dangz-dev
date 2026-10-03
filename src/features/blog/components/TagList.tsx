import { TagChip } from '@/components/ui';
import type { TopicSummary } from '@/features/blog/types/Topic.types';

type TopicListProps = Readonly<{
  topic?: TopicSummary | null;
  className?: string;
}>;

export default function TagList({ topic, className = '' }: TopicListProps) {
  if (!topic) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <TagChip {...topic} />
    </div>
  );
}
