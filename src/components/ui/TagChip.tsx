import Link from './Link';
import type { TopicSummary } from '@/features/blog/types/Topic.types';
import { getTopicHref } from '@/features/blog/utils/topics';
import clsx from 'clsx';

type TagChipProps = Readonly<TopicSummary & { size?: 'default' | 'comfortable' }>;

export default function TagChip({ displayName, slug, size = 'default' }: TagChipProps) {
  return (
    <Link
      href={getTopicHref(slug.current)}
      type="accent"
      className={clsx(
        'inline-flex max-w-full items-center rounded-md bg-accent-light/10 dark:bg-accent-dark/10 font-semibold text-accent-light dark:text-accent-dark hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors duration-300',
        size === 'comfortable' ? 'px-2.5 py-1 text-sm leading-5' : 'px-1.5 py-0.5 md:px-2 text-[10px] md:text-xs',
      )}
    >
      {displayName}
    </Link>
  );
}
