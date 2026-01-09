interface BlogLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}

export default async function BlogLayout({ children, heading, sidebar }: BlogLayoutProps) {
  return (
    <article>
      {heading}

      <div className="flex flex-row my-8 border-t border-border-light dark:border-border-dark">
        <aside className="p-4 pt-8 mb-8 w-full min-h-72 max-w-[256px]">
          {sidebar}
        </aside>
        <section className="flex-1 p-4 border-border-light dark:border-border-dark border-l">
          {children}
        </section>
      </div>
    </article>
  );
}
