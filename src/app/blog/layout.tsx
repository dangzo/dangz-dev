interface BlogLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}

export default async function BlogLayout({ children, heading, sidebar }: BlogLayoutProps) {
  return (
    <article>
      {heading}

      <div className="flex flex-row my-8 gap-10 border-t">
        {sidebar}
        {children}
      </div>
    </article>
  );
}
