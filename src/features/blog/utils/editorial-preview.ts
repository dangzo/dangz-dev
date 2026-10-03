import 'server-only';
import type { PostWithTopic } from '@/features/blog/types/Post.types';

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

export function getEditorialSummary(post: Readonly<Pick<PostWithTopic, '_id' | 'excerpt'>>) {
  if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_EDITORIAL_PREVIEW !== 'true') {
    return post.excerpt;
  }

  const documentId = post._id.replace(/^drafts\./, '');

  return EDITORIAL_SUMMARIES[documentId] ?? post.excerpt;
}
