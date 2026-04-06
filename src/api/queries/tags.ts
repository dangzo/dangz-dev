import type { PostTags, TagWithCount } from '@/types/Tag.types';
import { query } from '@/api/apollo-client';
import { gql } from '@apollo/client';

const TAGS_WITH_COUNT_QUERY = gql`
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

export async function getTagsWithCount() {
  const { data } = await query<{ allTag: TagWithCount[], allPost: PostTags[] }>({
    query: TAGS_WITH_COUNT_QUERY
  });
  const { allTag: tags, allPost: postTags } = data ?? {};

  const tagCount = (slug?: string) => {
    return postTags?.filter(pt => pt?.tags?.some(t => t.slug?.current === slug)).length ?? 0;
  };

  return { tags, tagCount };
}