import { PostList } from '@/components/blog';

const TagsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <PostList tag={slug} />
  );
};

export default TagsPage;
