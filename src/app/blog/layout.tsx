interface BlogLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}

export default async function BlogLayout({ children, heading, sidebar }: Readonly<BlogLayoutProps>) {
  return (
    <article>
      {heading}

      <div className="mt-6 mb-0 flex flex-col border-t border-border-light md:mb-8 md:flex-row dark:border-border-dark">
        <aside className="w-full min-w-45 border-border-light/70 px-3 pt-6 pb-0 md:mb-8 md:mt-0 md:min-h-72 md:w-75 md:shrink-0 md:border-t-0 md:px-2 md:py-4 md:pt-8">
          {sidebar}
        </aside>
        <section className="min-w-0 flex-1 p-0 md:p-4">
          {children}
        </section>
      </div>
    </article>
  );
}
