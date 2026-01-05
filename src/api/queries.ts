import { gql } from '@apollo/client';

export const POST_LIST_QUERY = ({ limit = 12, offset = 0 }: {limit?: number, offset?: number}) => {
  return gql`
    query AllPosts {
      allPost(sort: [{ publishedAt: DESC }], limit: ${limit}, offset: ${offset}) {
        _id
        title
        slug {
          current
        }
        image {
          asset {
            url
          }
        }
        tags {
          _id
          name
          slug {
            current
          }
        }
        bodyRaw
        publishedAt
      }
    }
  `;
};

export const TAGS_WITH_COUNT_QUERY = gql`
  query AllTags {
    allPost {
      tags {
        slug {
          current
        }
      }
    },
    allTag(sort: [{ name: ASC }]) {
      _id
      name
      slug {
        current
      }
    }
  }
`;
