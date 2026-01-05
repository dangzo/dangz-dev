import { Heading, Text } from '@/components/ui';

export default function HeadingDefault() {
  return (
    <>
      <Heading as="h1" className="text-6xl font-bold mb-8">
        All Posts
      </Heading>
      <Text className="mb-12" size="large">
        Brief description of what I'm writing about in my blog
      </Text>
    </>
  );
}
