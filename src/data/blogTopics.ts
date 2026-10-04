export type TopicDefinition = Readonly<{
  _id: string;
  displayName: string;
  slug: Readonly<{ current: string }>;
  description: string;
  editorialGuidance: string;
}>;

export type TopicSlug =
  | 'architecture'
  | 'performance'
  | 'accessibility'
  | 'full-stack-engineering'
  | 'interviews'
  | 'ai-assisted-development';

export const TOPICS: readonly TopicDefinition[] = [
  {
    _id: 'topic-architecture',
    displayName: 'Architecture',
    slug: { current: 'architecture' },
    description: 'Structure frontend applications and make design decisions that scale across the stack.',
    editorialGuidance: 'Use for application structure, boundaries, and design tradeoffs. Choose Full-Stack Engineering when the main benefit is implementing a complete feature across layers.',
  },
  {
    _id: 'topic-performance',
    displayName: 'Performance',
    slug: { current: 'performance' },
    description: 'Measure and improve rendering, responsiveness, and application speed.',
    editorialGuidance: 'Use when the reader learns to measure or reduce performance costs, including framework rendering strategies and web performance metrics.',
  },
  {
    _id: 'topic-accessibility',
    displayName: 'Accessibility',
    slug: { current: 'accessibility' },
    description: 'Build inclusive frontend interfaces with accessible content and interactions.',
    editorialGuidance: 'Use when accessible interaction or inclusive interface design is the main reader benefit.',
  },
  {
    _id: 'topic-full-stack-engineering',
    displayName: 'Full-Stack Engineering',
    slug: { current: 'full-stack-engineering' },
    description: 'Connect frontend interfaces, APIs, data, and runtime to build complete applications.',
    editorialGuidance: 'Use for end-to-end features and applications spanning interfaces, APIs, authentication, persistence, real-time communication, and deployment. Structural decisions belong in Architecture.',
  },
  {
    _id: 'topic-interviews',
    displayName: 'Interviews',
    slug: { current: 'interviews' },
    description: 'Prepare for frontend engineering interviews with practical questions and tradeoffs.',
    editorialGuidance: 'Use for practical engineering interview preparation, including senior frontend and full-stack discussions.',
  },
  {
    _id: 'topic-ai-assisted-development',
    displayName: 'AI-Assisted Development',
    slug: { current: 'ai-assisted-development' },
    description: 'Use coding agents, specifications, orchestration, and verification in software development.',
    editorialGuidance: 'Use when working with AI is the main reader benefit. Using AI to build an application does not automatically make this its primary topic.',
  },
];

// Approved article assignments keep the additive schema rollout independent of publication state.
// Draft IDs share the assignment of their published base ID; these entries never publish a post.
export const POST_TOPIC_ASSIGNMENTS: Readonly<Record<string, TopicSlug>> = {
  '27dd202f-fbfa-4549-b8a1-a9926769bfa6': 'architecture',
  '34d700ec-6ac2-422a-bc57-9156ec212900': 'performance',
  '51ab3708-b5ff-4ecf-a933-8afeef408b7e': 'accessibility',
  '56a36c36-3097-43b2-8244-d5179515a692': 'architecture',
  '9822cd44-6b22-43d4-bdef-533cad2ab4d5': 'full-stack-engineering',
  'a3db5c8d-71ec-4480-b59f-2771fa7aa0a7': 'architecture',
  'ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4': 'performance',
  'd56cb50b-6c83-43ac-a14c-e761db74b2b8': 'interviews',
  'cecb1ab3-1182-4de2-9955-703b1d0a87cd': 'ai-assisted-development',
};

// These historical URLs must survive removal or renaming of CMS tag documents.
// A null destination intentionally redirects broad or technology-specific tags to the blog.
export const LEGACY_TAG_REDIRECTS: Readonly<Record<string, TopicSlug | null>> = {
  'frontend-architecture': 'architecture',
  'design-patterns': 'architecture',
  scalability: 'architecture',
  'web-performance': 'performance',
  'performance-optimizations': 'performance',
  'core-web-vitals': 'performance',
  lighthouse: 'performance',
  'full-stack-development': 'full-stack-engineering',
  'cloud-deployment': 'full-stack-engineering',
  devops: 'full-stack-engineering',
  'web-accessibility': 'accessibility',
  'frontend-interviews': 'interviews',
  'clean-code': null,
  react: null,
  'vue-js': null,
  typescript: null,
  'next-js': null,
  'engineering-best-practices': null,
  frameworks: null,
  graphql: null,
};

export const EDITORIAL_SUMMARIES: Readonly<Record<string, string>> = {
  '27dd202f-fbfa-4549-b8a1-a9926769bfa6': 'Separate UI, business logic, and data access in React and Vue. Learn where each responsibility belongs and how clear boundaries make frontend code easier to test and change.',
  '34d700ec-6ac2-422a-bc57-9156ec212900': 'Follow the Next.js optimizations that raised this site’s Lighthouse performance score from around 50 to nearly 100. See how smaller bundles, server rendering, and smarter image and data loading made the difference.',
  '51ab3708-b5ff-4ecf-a933-8afeef408b7e': 'Build more accessible React and Vue interfaces with semantic HTML, clear form labels, and intentional focus management. Includes practical patterns for keyboard navigation, ARIA, and accessibility checks.',
  '56a36c36-3097-43b2-8244-d5179515a692': 'Compare monolithic applications, monorepos, and multiple repositories through realistic examples. Understand how deployment, shared dependencies, and team autonomy shape the right choice for your codebase.',
  '9822cd44-6b22-43d4-bdef-533cad2ab4d5': 'Trace a real-time chat app from Vue and Socket.io to Docker and AWS deployment. Explore frontend architecture, WebSocket connections, and an automated delivery pipeline built over an afternoon.',
  'a3db5c8d-71ec-4480-b59f-2771fa7aa0a7': 'Compare folders by type, Atomic Design, feature-based organization, and hexagonal architecture for React apps. Learn which tradeoffs matter as your project grows and how to keep related code easy to find.',
  'ccc19dd2-2579-4cc7-8cd0-a14c4ececdc4': 'Explore how Vue’s Vapor Mode replaces Virtual DOM work with compiler-generated DOM updates. Compare rendering approaches and understand the tradeoffs and limitations before experimenting with it.',
  'd56cb50b-6c83-43ac-a14c-e761db74b2b8': 'Work through a React interview exercise with repeated renders, duplicate requests, and sluggish search. Learn how to diagnose the issues, refactor the component, and discuss production tradeoffs as a senior engineer.',
};

export type SearchKeywordSource = Readonly<{
  _id: string;
  keywords?: readonly string[] | null;
  tags?: readonly Readonly<{
    name?: string;
    slug?: Readonly<{ current?: string }>;
  }>[] | null;
}>;

const TECHNOLOGY_ALIASES: Readonly<Record<string, readonly string[]>> = {
  react: ['React.js', 'ReactJS'],
  'vue-js': ['Vue', 'Vue.js', 'VueJS'],
  'next-js': ['Next', 'Next.js', 'NextJS'],
  typescript: ['TypeScript', 'TS'],
  graphql: ['GraphQL'],
};

export function getSearchKeywords(post: SearchKeywordSource): string[] {
  const keywords = [...(post.keywords ?? [])];

  for (const tag of post.tags ?? []) {
    if (tag.name) {
      keywords.push(tag.name);
    }

    const slug = tag.slug?.current;

    if (slug) {
      keywords.push(slug, slug.replace(/-/g, ' '));

      if (Object.hasOwn(TECHNOLOGY_ALIASES, slug)) {
        keywords.push(...TECHNOLOGY_ALIASES[slug]);
      }
    }
  }

  if (Object.hasOwn(POST_TOPIC_ASSIGNMENTS, post._id.replace(/^drafts\./, ''))) {
    keywords.push('frontend');
  }

  const seen = new Set<string>();

  return keywords.map((keyword) => keyword.trim()).filter((keyword) => {
    const normalized = keyword.toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}
