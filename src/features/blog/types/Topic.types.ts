export type TopicSummary = Readonly<{
  _id: string;
  displayName: string;
  slug: Readonly<{ current: string }>;
  description: string;
  editorialGuidance?: string;
}>;

export type TopicWithCount = TopicSummary & Readonly<{ postCount: number }>;

// CMS drafts can be saved before publication-required topic fields are filled.
export type TopicSource = Readonly<{
  _id: string;
  displayName?: string | null;
  slug?: Readonly<{ current?: string | null }> | null;
  description?: string | null;
  editorialGuidance?: string | null;
}>;
