import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { codeInput } from '@sanity/code-input';
import { graphiQLTool } from 'sanity-plugin-graphiql';
import { table } from '@sanity/table'

export default defineConfig({
  name: 'default',
  title: 'dangz-dev',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || '',

  plugins: [
    structureTool(),
    visionTool(),
    codeInput(),
    table(),
    graphiQLTool({
      apiVersion: process.env.SANITY_STUDIO_API_VERSION || '',
      // url: process.env.SANITY_STUDIO_GRAPHQL_API_URL || '',
      name: 'graphiql',
      title: 'GraphQL',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
