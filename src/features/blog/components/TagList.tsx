import { TagChip } from '@/components/ui';
import type { Tag as TagType } from '@/types/sanity.types';

interface TagListProps {
  tags: TagType[];
  className?: string
}

export default async function TagList({ tags, className = '' }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <TagChip key={tag._id} {...tag} />
      ))}
    </div>
  );
}
