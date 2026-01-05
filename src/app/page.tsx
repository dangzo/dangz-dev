import { Text, Link, Heading } from '@/components/ui';

export default async function HomePage() {

  return (
    <article>
      <Heading as="h1" className="mb-8">Home</Heading>
      <Text>Empty. See <Link href="/blog">Blog page</Link> first.</Text>
    </article>
  );
}
