import type { TopicSummary } from '@/features/blog/types/Topic.types';

export type TopicSlug =
  | 'architecture'
  | 'performance'
  | 'accessibility'
  | 'full-stack-engineering'
  | 'interviews'
  | 'ai-assisted-development';

export const TOPICS: readonly TopicSummary[] = [
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
