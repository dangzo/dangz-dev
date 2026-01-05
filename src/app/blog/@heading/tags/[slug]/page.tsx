import { startCase } from 'lodash-es';
import { Heading, Text } from '@/components/ui';

export default async function BlogTagsSlugHeading({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <Heading as="h1" className="text-6xl font-bold mb-8">
        {`Tag: ${startCase(slug)}`}
      </Heading>
      <Text className="mb-12" size="large">
        Brief description of what I'm writing about in my blog
      </Text>
    </>
  );
}
