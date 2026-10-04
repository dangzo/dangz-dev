import { Stack, Text } from '@sanity/ui';
import { useFormValue, type SlugInputProps } from 'sanity';
import { useTopicDetails } from './useTopicDetails';

export function TopicSlugInput(props: Readonly<SlugInputProps>) {
  const value = useFormValue(['_id']);
  const documentId = typeof value === 'string' ? value.replace(/^drafts\./, '') : '';

  return (
    <StableSlug key={documentId} documentId={documentId} {...props} />
  );
}

function StableSlug(props: Readonly<SlugInputProps & { documentId: string }>) {
  const state = useTopicDetails(props.documentId);
  const readOnly = props.readOnly || state.status !== 'ready' || Boolean(state.topic);

  return (
    <Stack gap={3}>
      {props.renderDefault({ ...props, readOnly })}
      {state.status === 'error' && (
        <Text size={1} role="alert">Could not verify the published slug. Reopen the topic to retry.</Text>
      )}
    </Stack>
  );
}
