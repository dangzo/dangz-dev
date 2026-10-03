import { usesPrimaryTopicModel } from '@/api/apollo-client';

export const getPrimaryTopicFields = () => {
  return usesPrimaryTopicModel()
    ? `primaryTopic {
        _id
        displayName
        slug { current }
        description
        editorialGuidance
      }
      keywords`
    : '';
};

export const getPostTopicFields = () => {
  return usesPrimaryTopicModel()
    ? getPrimaryTopicFields()
    : `tags {
        _id
        name
        slug { current }
      }`;
};
