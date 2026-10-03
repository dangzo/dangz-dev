import BlogFrame from '@/features/blog/components/BlogFrame';

interface BlogLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  sidebar: React.ReactNode;
}

export default async function BlogLayout({ children, heading, sidebar }: Readonly<BlogLayoutProps>) {
  return (
    <BlogFrame heading={heading} sidebar={sidebar}>
      {children}
    </BlogFrame>
  );
}
