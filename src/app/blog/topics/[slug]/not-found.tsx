import { Heading, Text, Link } from '@/components/ui';

export default function TopicNotFound() {
  return (
    <div>
      <Heading as="h2" className="mb-4">Topic Not Found</Heading>
      <Text>No posts matching this topic exist.</Text>
      <Link href="/blog">Browse all posts</Link>
    </div>
  );
}
