import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

const isDev = process.env.NODE_ENV === 'development';
const readToken = process.env.SANITY_API_READ_ONLY_TOKEN;
const canPreviewDrafts = isDev && Boolean(readToken);

const graphqlBaseUrl = 'https://wdxhl3tc.api.sanity.io/v2023-08-01/graphql/production/default';
const graphqlUri = canPreviewDrafts
  ? `${graphqlBaseUrl}?perspective=previewDrafts`
  : graphqlBaseUrl;

export const { getClient, PreloadQuery } = registerApolloClient(() => {
  if (isDev && !readToken) {
    // eslint-disable-next-line no-console
    console.warn('Sanity draft preview disabled: set SANITY_API_READ_ONLY_TOKEN in .env');
  }

  return new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: canPreviewDrafts ? 'no-cache' : 'cache-first',
      },
    },
    link: new HttpLink({
      // For draft preview in dev, set SANITY_API_READ_ONLY_TOKEN in .env.
      // In production or without token, this falls back to published content.
      uri: graphqlUri,
      headers: canPreviewDrafts
        ? {
          Authorization: `Bearer ${readToken}`,
        }
        : undefined,
      fetchOptions: canPreviewDrafts
        ? { cache: 'no-store' }
        : { next: { revalidate: 3600 } },
    }),
  });
});
