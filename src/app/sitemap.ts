import { MetadataRoute } from 'next';
import { siteUrl } from '@/data/siteMetadata';
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
  const posts = await getPostSlugs();
  const blogPosts: MetadataRoute.Sitemap = posts
    .filter(post => post.slug?.current)
    .map(post => ({
      url: `${baseUrl}/blog/${post.slug.current}`,
      changeFrequency: 'never' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...blogPosts];
}
