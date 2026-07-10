interface BlogLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}

export default async function BlogLayout({ children, heading, sidebar }: Readonly<BlogLayoutProps>) {
  return (
    <article>
      {heading}

      <div className="flex flex-col-reverse md:flex-row mt-6 mb-0 md:mb-8 border-t border-border-light dark:border-border-dark">
        <section className="min-w-0 flex-1 p-0 md:p-4">
          {children}
        </section>
        <aside className="border-border-light/70 pt-6 pb-0 px-2 w-full md:mt-0 md:border-t-0 md:pt-8 md:py-4 md:mb-8 md:min-h-72 md:shrink-0 min-w-45 md:w-75">
          {sidebar}
        </aside>
      </div>
    </article>
  );
}
