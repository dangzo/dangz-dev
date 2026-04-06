import { Heading } from '@/components/ui';
import { BlogTagline } from '@/components/blog';

export default async function HeadingDefault() {
  return (
    <>
      <Heading as="h1">
        All Posts
      </Heading>
      <BlogTagline />
    </>
  );
}
