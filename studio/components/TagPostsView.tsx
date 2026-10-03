import { useEffect, useState } from 'react';
import { Card, Spinner, Stack, Text } from '@sanity/ui';
import { useDocumentStore } from 'sanity';
import { IntentLink } from 'sanity/router';

type Post = Readonly<{
  _id: string;
  title: string | null;
}>;

type PostsState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error' }>
  | Readonly<{ status: 'ready'; posts: readonly Post[] }>;

const postsQuery = {
  fetch: '*[_type == "post" && $tagId in tags[]._ref] | order(title asc) {_id, title}',
  // Watch all posts so removing a tag also refreshes the list.
  listen: '*[_type == "post"]',
};

export function TagPostsView({ documentId }: Readonly<{ documentId: string }>) {
  const tagId = documentId.replace(/^drafts\./, '');

  return (
    <TagPostsList key={tagId} tagId={tagId} />
  );
}

function TagPostsList({ tagId }: Readonly<{ tagId: string }>) {
  const documentStore = useDocumentStore();
  const [state, setState] = useState<PostsState>({ status: 'loading' });

  useEffect(() => {
    const subscription = documentStore.listenQuery(
      postsQuery,
      { tagId },
      { apiVersion: '2025-02-19', perspective: 'drafts' },
    ).subscribe({
      next: (posts: readonly Post[]) => {
        setState({ status: 'ready', posts });
      },
      error: () => {
        setState({ status: 'error' });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [documentStore, tagId]);

  return (
    <Stack padding={4} space={4}>
      <Text size={2} weight="semibold">Blog posts with this tag</Text>
      {state.status === 'loading' && (
        <Card padding={3} role="status">
          <Stack space={3}>
            <Spinner />
            <Text>Loading posts…</Text>
          </Stack>
        </Card>
      )}
      {state.status === 'error' && (
        <Card padding={3} tone="critical" role="alert">
          <Text>Could not load posts. Reopen this tab to try again.</Text>
        </Card>
      )}
      {state.status === 'ready' && state.posts.length === 0 && (
        <Text muted>No blog posts use this tag yet.</Text>
      )}
      {state.status === 'ready' && state.posts.length > 0 && (
        <Stack as="ul" space={3}>
          {state.posts.map((post) => (
            <Card as="li" key={post._id} padding={3} border radius={2}>
              <IntentLink
                intent="edit"
                params={{ id: post._id, type: 'post' }}
              >
                {post.title || 'Untitled post'}
              </IntentLink>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
