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
    appId: 'igdyw1j1njx88r49y5zvgmga',
    autoUpdates: true,
  }
});
