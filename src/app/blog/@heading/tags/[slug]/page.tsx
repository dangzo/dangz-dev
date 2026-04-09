import { Heading } from '@/components/ui';
import { startCase } from '@/utils/strings';
import { BlogTagline } from '@/components/blog';

export default async function BlogTagsSlugHeading({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return (
    <>
      <Heading as="h1">
        {`Tag: ${startCase(slug)}`}
      </Heading>
      <BlogTagline topic={startCase(slug)} />
    </>
  );
}
