import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { codeInput } from '@sanity/code-input';
import { graphiQLTool } from 'sanity-plugin-graphiql';
import { table } from '@sanity/table';
import { TopicPostsView } from './components/TopicPostsView';
import { TOPICS } from '../src/data/blogTopics';

export default defineConfig({
  name: 'default',
  title: 'dangz-dev',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || '',

  document: {
    newDocumentOptions: (items, { creationContext }) => items.filter((item) => (
      item.templateId !== 'tag'
      && (item.templateId !== 'topic' || creationContext.type === 'structure')
    )),
    actions: (actions, { schemaType, documentId }) => {
      if (schemaType === 'tag') {
        return [];
      }

      if (schemaType === 'topic') {
        const seeded = TOPICS.some((topic) => topic._id === documentId?.replace(/^drafts\./, ''));

        return actions.filter((action) => action.action !== 'unpublish' && (!seeded || action.action !== 'delete'));
      }

      return actions;
    },
  },

  plugins: [
    structureTool({
      structure: (S) => S.list().title('Content').items([
        S.documentTypeListItem('post').title('Posts'),
        S.documentTypeListItem('topic').title('Topics'),
        S.divider(),
        ...S.documentTypeListItems().filter((item) => !['post', 'topic', 'tag'].includes(item.getId() || '')),
      ]),
      defaultDocumentNode: (S, { schemaType }) => {
        if (schemaType === 'topic') {
          return S.document().views([
            S.view.form(),
            S.view.component(TopicPostsView).title('Posts'),
          ]);
        }

        return S.document().views([S.view.form()]);
      },
    }),
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
