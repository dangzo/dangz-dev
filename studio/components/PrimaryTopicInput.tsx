import { Card, Stack, Text } from '@sanity/ui';
import { useFormValue, type InputProps } from 'sanity';
import { useTopicDetails } from './useTopicDetails';

export function PrimaryTopicInput(props: Readonly<InputProps>) {
  const reference = useFormValue(['primaryTopic', '_ref']);
  const topicId = typeof reference === 'string' ? reference : '';

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      {topicId && <TopicGuidance key={topicId} topicId={topicId} />}
    </Stack>
  );
}

function TopicGuidance({ topicId }: Readonly<{ topicId: string }>) {
  const state = useTopicDetails(topicId);

  if (state.status === 'loading') {
    return (
      <Text muted size={1} role="status">Loading topic guidance…</Text>
    );
  }

  if (state.status === 'error') {
    return (
      <Text size={1} role="alert">Could not load topic guidance. Reselect the topic to retry.</Text>
    );
  }

  if (!state.topic) {
    return (
      <Text size={1}>Publish this topic in Topics before using it to publish a post.</Text>
    );
  }

  return (
    <Card padding={3} border radius={2}>
      <Stack gap={3}>
        <Text size={1} weight="semibold">{state.topic.displayName}</Text>
        <Text size={1}>{state.topic.description}</Text>
        <Text size={1} muted>{state.topic.editorialGuidance}</Text>
      </Stack>
    </Card>
  );
}
