import type { PostReactionSummaryItem } from '@/features/blog/types/Post.types';
import { Link } from '@/components/ui';

interface ReactionsSummaryProps {
  reactions?: PostReactionSummaryItem[];
  href: string;
}

export default function ReactionsSummary({ reactions, href }: Readonly<ReactionsSummaryProps>) {
  const visibleReactions = reactions?.filter((reaction) => (reaction.count ?? 0) > 0 && reaction.emoji) ?? [];

  if (visibleReactions.length === 0) {
    return null;
  }

  const totalReactions = visibleReactions.reduce((sum, reaction) => sum + (reaction.count ?? 0), 0);

  return (
    <Link
      href={href}
      type="primary"
      className="inline-flex items-center gap-1 text-secondary-light dark:text-secondary-dark"
      aria-label={`${totalReactions} reactions - open post`}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {visibleReactions.map((reaction) => (
          <span key={reaction._id} className="text-sm leading-none">
            {reaction.emoji}
          </span>
        ))}
      </span>
      <span className="text-xs leading-none tabular-nums">
        {totalReactions} reactions
      </span>
    </Link>
  );
}