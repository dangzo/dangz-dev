import { TOPICS } from '@/features/blog/data/topics';

const image = {
  asset: {
    url: 'https://cdn.sanity.io/images/wdxhl3tc/production/098fa2b1b448e79f99fd53f629d2fb721bdec4a2-1536x1024.png',
    metadata: {
      lqip: '',
    },
  },
};

const tags = [
  { _id: 'tag-react', _type: 'tag', _createdAt: '2025-01-01', _updatedAt: '2025-01-01', _rev: '1', name: 'React', slug: { _type: 'slug', current: 'react' } },
  { _id: 'tag-testing', _type: 'tag', _createdAt: '2025-01-01', _updatedAt: '2025-01-01', _rev: '1', name: 'Testing', slug: { _type: 'slug', current: 'testing' } },
  { _id: 'tag-typescript', _type: 'tag', _createdAt: '2025-01-01', _updatedAt: '2025-01-01', _rev: '1', name: 'TypeScript', slug: { _type: 'slug', current: 'typescript' } },
] as const;

const articleBody = [
  {
    _key: 'intro',
    _type: 'block',
    style: 'normal',
    children: [{ _key: 'intro-text', _type: 'span', text: 'A representative article body keeps the visual baseline focused on typography, width, and vertical rhythm.' }],
    markDefs: [],
  },
  {
    _key: 'first-heading',
    _type: 'block',
    style: 'h2',
    children: [{ _key: 'first-heading-text', _type: 'span', text: 'A predictable content hierarchy' }],
    markDefs: [],
  },
  {
    _key: 'body-copy',
    _type: 'block',
    style: 'normal',
    children: [{ _key: 'body-copy-text', _type: 'span', text: 'The fixture includes the common rich-content shapes used by production posts without depending on editorial changes.' }],
    markDefs: [],
  },
  {
    _key: 'code-example',
    _type: 'code',
    language: 'ts',
    code: 'const stable = \'visual regression\';\n\nexport default stable;',
  },
  {
    _key: 'second-heading',
    _type: 'block',
    style: 'h2',
    children: [{ _key: 'second-heading-text', _type: 'span', text: 'A compact comparison table' }],
    markDefs: [],
  },
  {
    _key: 'comparison-table',
    _type: 'table',
    rows: [
      { _key: 'table-head', _type: 'tableRow', cells: ['Signal', 'Coverage'] },
      { _key: 'table-layout', _type: 'tableRow', cells: ['Screenshot', 'Visual layout'] },
      { _key: 'table-behaviour', _type: 'tableRow', cells: ['E2E assertion', 'User behaviour'] },
    ],
  },
];

const posts = Array.from({ length: 16 }, (_, index) => {
  const postNumber = index + 1;
  const postTags = index % 2 === 0 ? [tags[0], tags[1]] : [tags[2]];
  const topicIndex = index < 10 ? 0 : index === 15 ? 5 : index - 9;
  const primaryTopic = index === 14 ? null : TOPICS[topicIndex];

  return {
    _id: index === 15 ? 'drafts.post-16' : `post-${postNumber}`,
    _type: 'post',
    _createdAt: '2025-01-01',
    _updatedAt: '2025-01-01',
    _rev: '1',
    title: postNumber === 1 ? 'Building stable visual regression tests' : index === 15 ? 'Unpublished AI workflow' : `Fixture post ${postNumber}`,
    slug: { _type: 'slug', current: postNumber === 1 ? 'stable-visual-regression-tests' : index === 15 ? 'unpublished-ai-workflow' : `fixture-post-${postNumber}` },
    publishedAt: `2025-0${Math.min(postNumber, 9)}-01T12:00:00.000Z`,
    image,
    imageAltText: 'Abstract blue and purple shapes',
    excerpt: 'A deterministic fixture excerpt that establishes the expected card layout',
    tags: postTags,
    primaryTopic,
    keywords: index === 9 ? ['pagination-keyword-only'] : index === 15 ? ['draft-only-keyword'] : [],
    body: postNumber === 1 ? articleBody : undefined,
  };
});

const reactions = [
  { _id: 'reaction-useful', name: 'Useful', emoji: '💡', sortOrder: 1 },
  { _id: 'reaction-love', name: 'Love', emoji: '❤️', sortOrder: 2 },
];

type FixturePost = typeof posts[number];
type FixtureQueryPost = Omit<FixturePost, 'tags' | 'primaryTopic' | 'keywords'> & Partial<Pick<FixturePost, 'tags' | 'primaryTopic' | 'keywords'>>;

interface GraphQLRequest {
  operationName: string;
  query: string;
  variables?: Readonly<Record<string, unknown>>;
  perspective?: 'published' | 'previewDrafts';
}

function getPostsPage(query: string, visiblePosts: readonly FixtureQueryPost[]) {
  const limit = Number(query.match(/limit:\s*(\d+)/)?.[1] ?? visiblePosts.length);
  const offset = Number(query.match(/offset:\s*(\d+)/)?.[1] ?? 0);

  return visiblePosts.slice(offset, offset + limit);
}

export function getE2EGraphQLResponse({ operationName, query, variables, perspective = 'published' }: Readonly<GraphQLRequest>) {
  const perspectivePosts = perspective === 'previewDrafts'
    ? posts
    : posts.filter((post) => !post._id.startsWith('drafts.'));
  const visiblePosts: FixtureQueryPost[] = perspectivePosts.map(({ tags: postTags, primaryTopic, keywords, ...post }) => ({
    ...post,
    ...(/\btags\s*\{/.test(query) ? { tags: postTags } : {}),
    ...(/\bprimaryTopic\s*\{/.test(query) ? { primaryTopic } : {}),
    ...(/\bkeywords\b/.test(query) ? { keywords } : {}),
  }));

  if (operationName === 'AllPosts') {
    return {
      allPost: getPostsPage(query, visiblePosts),
      allReaction: reactions,
      allPostReactionCount: [
        { count: 3, post: { _id: 'post-1' }, reaction: { _id: 'reaction-useful' } },
        { count: 1, post: { _id: 'post-1' }, reaction: { _id: 'reaction-love' } },
      ],
    };
  }

  if (operationName === 'AllTags') {
    return {
      allPost: visiblePosts,
      allTag: tags,
    };
  }

  if (operationName === 'AllTopics') {
    return {
      allPost: visiblePosts,
      allTopic: /\ballTopic\b/.test(query) ? TOPICS : undefined,
    };
  }

  if (operationName === 'SearchablePosts') {
    return { allPost: visiblePosts };
  }

  if (operationName === 'postsBySlug') {
    const slug = typeof variables?.slug === 'string'
      ? variables.slug
      : query.match(/current:\s*\{\s*eq:\s*"([^"]+)"/)?.[1];

    return {
      allPost: visiblePosts.filter((post) => post.slug.current === slug),
    };
  }

  if (operationName === 'AllPostSlugs') {
    return {
      allPost: visiblePosts.map((post) => ({ slug: post.slug })),
    };
  }

  throw new Error(`Unsupported E2E GraphQL operation: ${operationName}`);
}
