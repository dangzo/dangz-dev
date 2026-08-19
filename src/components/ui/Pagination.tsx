import clsx from 'clsx';
import Link from './Link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const pageHref = (basePath: string, page: number) => (page === 1 ? basePath : `${basePath}/page/${page}`);

const controlClasses = 'rounded-md border border-border-light px-3 py-1.5 text-sm dark:border-border-dark';
const disabledClasses = 'pointer-events-none opacity-40';

export default function Pagination({ currentPage, totalPages, basePath }: Readonly<PaginationProps>) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={hasPrevious ? pageHref(basePath, currentPage - 1) : basePath}
        type="secondary"
        className={clsx(controlClasses, { [disabledClasses]: !hasPrevious })}
        aria-disabled={!hasPrevious}
        tabIndex={hasPrevious ? undefined : -1}
      >
        Previous
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(basePath, page)}
          type="primary"
          isActive={page === currentPage}
          aria-current={page === currentPage ? 'page' : undefined}
          className={clsx(controlClasses, { 'font-semibold': page === currentPage })}
        >
          {page}
        </Link>
      ))}

      <Link
        href={hasNext ? pageHref(basePath, currentPage + 1) : basePath}
        type="secondary"
        className={clsx(controlClasses, { [disabledClasses]: !hasNext })}
        aria-disabled={!hasNext}
        tabIndex={hasNext ? undefined : -1}
      >
        Next
      </Link>
    </nav>
  );
}
