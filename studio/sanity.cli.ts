import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
    dataset: process.env.SANITY_STUDIO_DATASET || '',
  },
  graphql: [
    {
      playground: true,
      tag: 'default',
    },
  ],
  deployment: {
    appId: 'gpa5us40z0cl5nh6sz76l9bl',
    autoUpdates: true,
  }
});
