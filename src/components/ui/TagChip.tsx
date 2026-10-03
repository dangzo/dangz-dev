import Link from './Link';
import type { TopicSummary } from '@/features/blog/types/Topic.types';
import { getTopicHref } from '@/features/blog/utils/topics';

export default function TagChip({ displayName, slug }: Readonly<TopicSummary>) {
  return (
    <Link
      href={getTopicHref(slug.current)}
      type="accent"
      className="inline-flex items-center rounded-md bg-accent-light/10 dark:bg-accent-dark/10 px-1.5 py-0.5 md:px-2 text-[10px] md:text-xs font-semibold text-accent-light dark:text-accent-dark hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors duration-300"
    >
      {displayName}
    </Link>
  );
}
