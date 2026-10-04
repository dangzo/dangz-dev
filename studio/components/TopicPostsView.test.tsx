import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { TopicPostsView } from './TopicPostsView';
import type { PostVariant } from '../utils/topicUsage';

type Observer = Readonly<{ next: (posts: readonly PostVariant[]) => void; error: () => void }>;

const store = vi.hoisted(() => ({ listenQuery: vi.fn() }));
vi.mock('sanity', () => ({ useDocumentStore: () => store }));
vi.mock('@sanity/ui', async () => import('../test-support/mockUi'));
vi.mock('sanity/router', () => ({
  IntentLink: ({ children, params }: Readonly<{ children: ReactNode; params: Readonly<{ id: string; type: string }> }>) => (
    <a href={`/edit/${params.type}/${params.id}`}>{children}</a>
  ),
}));

let observers: Observer[];
let unsubscribe: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observers = [];
  unsubscribe = vi.fn();
  store.listenQuery.mockReset().mockReturnValue({ subscribe: (observer: Observer) => {
    observers.push(observer);

    return { unsubscribe };
  } });
});

const published: PostVariant = { _id: 'post-1', title: 'Published article', topicId: 'topic-architecture', topicName: 'Architecture' };
const draft: PostVariant = { _id: 'drafts.post-1', title: 'Pending edit', topicId: 'topic-performance', topicName: 'Performance' };

describe('live topic usage', () => {
  it('shows loading, both assignments, correct edit links, and an empty state after removal', () => {
    const { unmount } = render(<TopicPostsView documentId="drafts.topic-architecture" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading posts');
    expect(store.listenQuery).toHaveBeenCalledWith(expect.objectContaining({ listen: '*[_type in ["post", "topic"]]' }), {}, expect.objectContaining({ perspective: 'raw' }));
    act(() => observers[0].next([published, draft]));

    expect(screen.getByText('Published: Architecture')).toBeInTheDocument();
    expect(screen.getByText('Draft changes: Performance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pending edit' })).toHaveAttribute('href', '/edit/post/post-1');
    expect(screen.getByText(/Posts: 1 · Published assignments: 1 · Draft assignments: 0/)).toBeInTheDocument();
    act(() => observers[0].next([draft]));
    expect(screen.getByText('No posts use this topic yet.')).toBeInTheDocument();
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('shows draft-only articles, filters other topics and releases, and resets when switching topics', () => {
    const { rerender } = render(<TopicPostsView documentId="topic-performance" />);
    act(() => observers[0].next([draft, { ...draft, _id: 'versions.release.other' }]));

    expect(screen.getByText('Draft only: Performance')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    rerender(<TopicPostsView documentId="topic-accessibility" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading posts');
    expect(unsubscribe).toHaveBeenCalledOnce();
    act(() => observers[1].next([published, draft]));
    expect(screen.getByText('No posts use this topic yet.')).toBeInTheDocument();
  });

  it('shows errors and retries with a fresh subscription', () => {
    render(<TopicPostsView documentId="topic-performance" />);
    act(() => observers[0].error());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load posts');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(unsubscribe).toHaveBeenCalledOnce();
    act(() => observers[1].next([draft]));
    expect(screen.getByText('Draft only: Performance')).toBeInTheDocument();
  });
});
