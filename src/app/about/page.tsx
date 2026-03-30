import { Heading, Text } from '@/components/core';

export default async function AboutPage() {
  return (
    <article>
      <Heading as="h1" className="text-4xl font-bold mb-8">About Page</Heading>
      <Text>Text here</Text>
    </article>
  );
}
