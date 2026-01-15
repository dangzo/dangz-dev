import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'wdxhl3tc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

export default client;
