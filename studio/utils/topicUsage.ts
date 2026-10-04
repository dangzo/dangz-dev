export type PostVariant = Readonly<{
  _id: string;
  title: string | null;
  topicId: string | null;
  topicName: string | null;
}>;

export type TopicUsage = Readonly<{
  id: string;
  title: string;
  published?: PostVariant;
  draft?: PostVariant;
}>;

export function getTopicUsage(posts: readonly PostVariant[], topicId: string): readonly TopicUsage[] {
  const groups = new Map<string, { published?: PostVariant; draft?: PostVariant }>();

  for (const post of posts) {
    if (post._id.startsWith('versions.')) {
      continue;
    }

    const id = post._id.replace(/^drafts\./, '');
    const group = groups.get(id) ?? {};

    if (post._id.startsWith('drafts.')) {
      group.draft = post;
    } else {
      group.published = post;
    }

    groups.set(id, group);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.published?.topicId === topicId || group.draft?.topicId === topicId)
    .map(([id, group]) => ({
      id,
      title: group.draft?.title || group.published?.title || 'Untitled post',
      ...group,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
