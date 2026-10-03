import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

export const CMS_CONTENT_CACHE_TAG = 'sanity-content';
export const SEARCH_CORPUS_CACHE_TAG = 'blog-search-corpus';

export type ContentReadOptions = Readonly<{ publishedOnly?: boolean }>;

export const isDraftPreviewEnabled = () => {
  return process.env.NODE_ENV === 'development' && Boolean(process.env.SANITY_API_READ_ONLY_TOKEN);
};

export const usesPrimaryTopicModel = () => {
  return process.env.SANITY_TOPIC_MODEL === 'primary';
};

export const getContentClient = ({ publishedOnly = false }: ContentReadOptions = {}) => {
  const preview = !publishedOnly && isDraftPreviewEnabled();
  const fixtures = process.env.E2E_FIXTURES === 'true';
  const baseUrl = fixtures
    ? process.env.E2E_FIXTURES_URL ?? 'http://127.0.0.1:3100/api/e2e/sanity'
    : 'https://wdxhl3tc.api.sanity.io/v2023-08-01/graphql/production/default';
  const uri = `${baseUrl}?perspective=${preview ? 'previewDrafts' : 'published'}`;

  return new ApolloClient({
    cache: new InMemoryCache(),
    // Next's tagged fetch cache owns persistence; Apollo must not retain stale
    // query results after a webhook invalidates that cache in a route handler.
    defaultOptions: { query: { fetchPolicy: 'no-cache' } },
    link: new HttpLink({
      uri,
      headers: preview
        ? { Authorization: `Bearer ${process.env.SANITY_API_READ_ONLY_TOKEN}` }
        : undefined,
      fetchOptions: preview || fixtures
        ? { cache: 'no-store' }
        : { next: { revalidate: 3600, tags: [CMS_CONTENT_CACHE_TAG] } },
    }),
  });
};

const defaultClient = registerApolloClient(() => getContentClient());
const publishedClient = registerApolloClient(() => getContentClient({ publishedOnly: true }));

export const getClient = (options: ContentReadOptions = {}) => {
  return options.publishedOnly ? publishedClient.getClient() : defaultClient.getClient();
};

export const PreloadQuery = defaultClient.PreloadQuery;
