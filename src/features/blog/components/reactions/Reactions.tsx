'use client';

import dynamic from 'next/dynamic';

const ReactionsClient = dynamic(() => import('./ReactionsClient'), {
  ssr: false,
});

interface ReactionsProps {
  postId: string;
}

const Reactions = ({ postId }: ReactionsProps) => <ReactionsClient postId={postId} />;

export default Reactions;