import Link from './Link';
import type { Tag } from '@/types/sanity.types';

export default async function TagChip({ _id, slug, name }: Tag) {
  return (
    <Link
      key={_id}
      href={`/blog/tags/${slug?.current}`}
      type='accent'
      className="
        inline-flex items-center rounded-md
        bg-accent-light/10 dark:bg-accent-dark/10
        px-2 py-1 text-xs font-semibold tracking-wide
        text-accent-light dark:text-accent-dark hover:bg-accent-light/20 dark:hover:bg-accent-dark/20
        transition-colors duration-300
        uppercase"
    >
      #{name}
    </Link>
  );
}
