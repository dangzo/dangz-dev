import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'wdxhl3tc',
  dataset: 'production',
  apiVersion: '2021-08-31',
  useCdn: process.env.NODE_ENV === 'production',
});

export default client;
