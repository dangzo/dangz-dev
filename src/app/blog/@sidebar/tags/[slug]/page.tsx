import { TagsSidebar } from '@/components/blog';

export default async function BlogSidebar({ params }: { params: { slug?: string } }) {
  const { slug } = await params;
  return <TagsSidebar activeSlug={slug} />;
}
