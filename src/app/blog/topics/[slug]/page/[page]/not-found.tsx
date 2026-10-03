import { Heading, Text, Link } from '@/components/ui';

export default function TopicPageNotFound() {
  return (
    <div>
      <Heading as="h2" className="mb-4">Page Not Found</Heading>
      <Text>This page does not exist for the topic.</Text>
      <Link href="/blog">Browse all posts</Link>
    </div>
  );
}
