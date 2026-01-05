import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { graphiQLTool } from 'sanity-plugin-graphiql';

export default defineConfig({
  name: 'default',
  title: 'dangz-dev',

  projectId: 'wdxhl3tc',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    graphiQLTool({
      apiVersion: '2023-08-01',
      url: 'https://wdxhl3tc.api.sanity.io/v2023-08-01/graphql/production/default',
      name: 'graphiql',
      title: 'GraphQL',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
