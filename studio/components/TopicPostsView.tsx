import { useEffect, useState } from 'react';
import { Button, Card, Spinner, Stack, Text } from '@sanity/ui';
import { useDocumentStore } from 'sanity';
import { IntentLink } from 'sanity/router';
import { getTopicUsage, type PostVariant, type TopicUsage } from '../utils/topicUsage';
import { STUDIO_API_VERSION } from '../utils/topicValidation';

type PostsState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error' }>
  | Readonly<{ status: 'ready'; posts: readonly TopicUsage[] }>;

const postsQuery = {
  fetch: `*[_type == "post" && !(_id in path("versions.**"))] {
    _id, title, "topicId": primaryTopic._ref, "topicName": primaryTopic->displayName
  }`,
  // Include removed assignments and topic copy edits, not just current matches.
  listen: '*[_type in ["post", "topic"]]',
};

export function TopicPostsView({ documentId }: Readonly<{ documentId: string }>) {
  const topicId = documentId.replace(/^drafts\./, '');
  const [attempt, setAttempt] = useState(0);

  return (
    <TopicPostsList
      key={`${topicId}:${attempt}`}
      topicId={topicId}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  );
}

function TopicPostsList({ topicId, onRetry }: Readonly<{ topicId: string; onRetry: () => void }>) {
  const documentStore = useDocumentStore();
  const [state, setState] = useState<PostsState>({ status: 'loading' });

  useEffect(() => {
    const subscription = documentStore.listenQuery(
      postsQuery,
      {},
      { apiVersion: STUDIO_API_VERSION, perspective: 'raw' },
    ).subscribe({
      next: (posts: readonly PostVariant[]) => {
        setState({ status: 'ready', posts: getTopicUsage(posts, topicId) });
      },
      error: () => {
        setState({ status: 'error' });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [documentStore, topicId]);

  return (
    <Stack padding={4} gap={4}>
      <Text size={2} weight="semibold">Posts assigned to this topic</Text>
      {state.status === 'loading' && (
        <Card padding={3} role="status">
          <Stack gap={3}>
            <Spinner />
            <Text>Loading posts…</Text>
          </Stack>
        </Card>
      )}
      {state.status === 'error' && (
        <Card padding={3} tone="critical" role="alert">
          <Stack gap={3}>
            <Text>Could not load posts.</Text>
            <Button text="Retry" onClick={onRetry} />
          </Stack>
        </Card>
      )}
      {state.status === 'ready' && (
        <>
          <Text size={1} muted>
            Posts: {state.posts.length} · Published assignments: {state.posts.filter((post) => post.published?.topicId === topicId).length} · Draft assignments: {state.posts.filter((post) => post.draft?.topicId === topicId).length}
          </Text>
          {state.posts.length === 0 && <Text muted>No posts use this topic yet.</Text>}
          <Stack as="ul" gap={3}>
            {state.posts.map((post) => (
              <Card as="li" key={post.id} padding={3} border radius={2}>
                <Stack gap={3}>
                  <IntentLink intent="edit" params={{ id: post.id, type: 'post' }}>
                    {post.title}
                  </IntentLink>
                  {post.published && (
                    <Text size={1}>Published: {post.published.topicName || 'Unclassified'}</Text>
                  )}
                  {post.draft && (
                    <Text size={1}>{post.published ? 'Draft changes' : 'Draft only'}: {post.draft.topicName || 'Unclassified'}</Text>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
