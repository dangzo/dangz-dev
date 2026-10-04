import { useEffect, useState } from 'react';
import { useDocumentStore } from 'sanity';
import { STUDIO_API_VERSION } from '../utils/topicValidation';

type TopicDetails = Readonly<{
  _id: string;
  displayName?: string;
  description?: string;
  editorialGuidance?: string;
}>;

type TopicState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error' }>
  | Readonly<{ status: 'ready'; topic: TopicDetails | null }>;

export function useTopicDetails(topicId: string): TopicState {
  const documentStore = useDocumentStore();
  const [state, setState] = useState<TopicState>({ status: 'loading' });

  useEffect(() => {
    const subscription = documentStore.listenQuery({
      fetch: '*[_type == "topic" && _id == $topicId][0] {_id, displayName, description, editorialGuidance}',
      listen: '*[_type == "topic"]',
    }, { topicId }, { apiVersion: STUDIO_API_VERSION, perspective: 'raw' }).subscribe({
      next: (topic: TopicDetails | null) => {
        setState({ status: 'ready', topic });
      },
      error: () => {
        setState({ status: 'error' });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [documentStore, topicId]);

  return state;
}
