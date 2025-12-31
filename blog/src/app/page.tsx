import { Link, Text, Heading } from '@/components';
import { type SanityDocument } from 'next-sanity';
import { POST_LIST_QUERY } from '@/api/queries';
import { client } from '@/sanity/client';


const options = { next: { revalidate: 30 } };

export default async function HomePage() {
  const posts = await client.fetch<SanityDocument[]>(POST_LIST_QUERY, {}, options);

  return (
    <article>
      <Heading as="h1" className="mb-8">Posts</Heading>
      <ul className="flex flex-col gap-y-4">
        {posts.map((post) => (
          <li className="hover:underline" key={post._id}>
            <Link href={`/${post.slug.current}`}>
              <Heading as="h2" className="text-xl font-semibold">{post.title}</Heading>
              <Text>{new Date(post.publishedAt).toLocaleDateString()}</Text>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
