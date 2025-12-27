import Link from './Link'

interface TagListProps {
  tags: string[]
  className?: string
}

export default function TagList({ tags, className = '' }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${tag}`}
          className="
            inline-flex items-center rounded-md
            bg-accent-light/10 dark:bg-accent-dark/10
            px-2 py-1 text-xs font-medium
            text-accent-light dark:text-accent-dark hover:no-underline! hover:bg-accent-light/20 dark:hover:bg-accent-dark/20
            transition-colors"
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
