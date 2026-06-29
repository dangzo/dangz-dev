'use client';

import dynamic from 'next/dynamic';

interface ReactionsClientProps {
  postId: string;
}

const Reactions = dynamic(
  () => import('./Reactions'),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function ReactionsClient({ postId }: ReactionsClientProps) {
  return <Reactions postId={postId} />;
}
