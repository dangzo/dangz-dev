'use client';

import dynamic from 'next/dynamic';
import { type ReactionsProps } from './Reactions';

const Reactions = dynamic(
  () => import('./Reactions'),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function ReactionsClient({ postId, variant = 'default' }: Readonly<ReactionsProps>) {
  return (
    <div className="mb-2">
      <Reactions postId={postId} variant={variant} />
    </div>
  );
}
