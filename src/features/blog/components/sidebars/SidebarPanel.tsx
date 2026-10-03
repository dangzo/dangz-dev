import clsx from 'clsx';

interface SidebarPanelProps {
  children: React.ReactNode;
  sticky?: boolean;
  footer?: React.ReactNode;
}

export default function SidebarPanel({
  children,
  sticky = false,
  footer,
}: Readonly<SidebarPanelProps>) {
  return (
    <div
      className={clsx('space-y-4', {
        'md:sticky md:top-12 md:max-h-[calc(100dvh-4rem)] md:space-y-6 md:overflow-y-auto md:pr-2 md:pb-8': sticky,
      })}
    >
      <section className="rounded-xl border border-border-light bg-background-secondary-light p-3 dark:border-border-dark dark:bg-background-secondary-dark md:p-5">
        {children}
      </section>

      {footer}
    </div>
  );
}
