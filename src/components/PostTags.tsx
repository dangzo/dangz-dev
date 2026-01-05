import Link from './ui/Link';
import type { Tag } from '@/types/sanity.types';

interface PostTagsProps {
  tags: Tag[];
  className?: string
}

export default async function PostTags({ tags, className = '' }: PostTagsProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag._id}
          href={`/blog/tags/${tag.slug?.current}`}
          type='accent'
          className="
            inline-flex items-center rounded-md
            bg-accent-light/10 dark:bg-accent-dark/10
            px-2 py-1 text-xs font-semibold tracking-wide
            text-accent-light dark:text-accent-dark hover:bg-accent-light/20 dark:hover:bg-accent-dark/20
            transition-colors duration-300
            uppercase"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
