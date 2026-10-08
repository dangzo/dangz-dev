'use client';

import { useContext, type ReactNode } from 'react';
import { ArticleImageViewerContext, type ArticleImageDescriptor } from './ArticleImageViewerContext';

type ArticleImageTriggerProps = Readonly<{
  image?: ArticleImageDescriptor;
  children: ReactNode;
}>;

export default function ArticleImageTrigger({ image, children }: ArticleImageTriggerProps) {
  const openViewer = useContext(ArticleImageViewerContext);

  if (!image || !openViewer) {
    return children;
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`View image: ${image.alt.trim() || 'Article image'}`}
      title="Open larger image"
      className="block w-full cursor-zoom-in rounded-md text-left focus-visible:-outline-offset-2 [&_img]:cursor-zoom-in"
      onClick={(event) => openViewer(image, event.currentTarget)}
    >
      {children}
    </button>
  );
}
