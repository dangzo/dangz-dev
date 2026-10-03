import { MetadataRoute } from 'next';
import { siteUrl } from '@/data/siteMetadata';
import { getTopicsWithCount } from '@/features/blog/api/queries/topics';
import { getPostSlugs } from '@/features/blog/api/queries/singlePost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Blog posts
  const [posts, { topics }] = await Promise.all([
    getPostSlugs({ publishedOnly: true }),
    getTopicsWithCount({ publishedOnly: true }),
  ]);
  const blogPosts: MetadataRoute.Sitemap = posts
    .filter(post => post.slug?.current)
    .map(post => ({
      url: `${baseUrl}/blog/${post.slug.current}`,
      changeFrequency: 'never' as const,
      priority: 0.7,
    }));

  const topicPages: MetadataRoute.Sitemap = topics
    .filter(topic => topic.postCount > 0)
    .map(topic => ({
      url: `${baseUrl}/blog/topics/${topic.slug.current}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...blogPosts, ...topicPages];
}
