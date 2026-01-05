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
    graphiQLTool({ apiVersion: '1', url: '/GraphQL', name: 'graphiql', title: ' GraphQL' }),
  ],

  schema: {
    types: schemaTypes,
  },
});
