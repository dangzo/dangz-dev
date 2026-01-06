import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { graphiQLTool } from 'sanity-plugin-graphiql';

const {
  SANITY_STUDIO_PROJECT_ID = '',
  SANITY_STUDIO_DATASET = '',
  SANITY_STUDIO_API_VERSION = '',
  SANITY_STUDIO_GRAPHQL_API_URL = '',
} = process.env;

export default defineConfig({
  name: 'default',
  title: 'dangz-dev',

  projectId: SANITY_STUDIO_PROJECT_ID,
  dataset: SANITY_STUDIO_DATASET,

  plugins: [
    structureTool(),
    visionTool(),
    graphiQLTool({
      apiVersion: SANITY_STUDIO_API_VERSION,
      url: SANITY_STUDIO_GRAPHQL_API_URL,
      name: 'graphiql',
      title: 'GraphQL',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
