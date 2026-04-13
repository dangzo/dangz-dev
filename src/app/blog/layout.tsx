interface BlogLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}

export default async function BlogLayout({ children, heading, sidebar }: BlogLayoutProps) {
  return (
    <article>
      {heading}

      <div className="flex flex-col md:flex-row mt-6 mb-0 md:mb-8 border-t border-border-light dark:border-border-dark">
        <aside className="pb-0 px-2 md:py-4 pt-6 md:pt-8 mb-4 md:mb-8 w-full md:min-h-72 min-w-[180px] md:max-w-[256px]">
          {sidebar}
        </aside>
        <section className="p-0 md:p-4">
          {children}
        </section>
      </div>
    </article>
  );
}
