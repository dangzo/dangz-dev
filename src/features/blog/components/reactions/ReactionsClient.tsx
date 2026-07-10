'use client';

import dynamic from 'next/dynamic';

interface ReactionsClientProps {
  postId: string;
  variant?: 'default' | 'compact';
}

const Reactions = dynamic(
  () => import('./Reactions'),
  {
    ssr: false,
    loading: () => null,
  },
);

const ReactionsCompact = dynamic(
  () => import('./ReactionsCompact'),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function ReactionsClient({ postId, variant = 'default' }: Readonly<ReactionsClientProps>) {
  return (
    <div className="mb-2">
      {variant === 'compact'
        ? <ReactionsCompact postId={postId} />
        : <Reactions postId={postId} />}
    </div>
  );
}
