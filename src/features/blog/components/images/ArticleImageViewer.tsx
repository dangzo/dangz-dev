'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { ArticleImageViewerContext, type ArticleImageDescriptor } from './ArticleImageViewerContext';
import ImageViewerModal from './ImageViewerModal';

type ImageSelection = Readonly<{
  image: ArticleImageDescriptor;
  trigger: HTMLButtonElement;
}>;

export default function ArticleImageViewer({ children }: Readonly<{ children: ReactNode }>) {
  const [selection, setSelection] = useState<ImageSelection | null>(null);

  const openViewer = useCallback((image: ArticleImageDescriptor, trigger: HTMLButtonElement) => {
    setSelection({ image, trigger });
  }, []);

  const dismissViewer = useCallback(() => {
    setSelection(null);
  }, []);

  return (
    <ArticleImageViewerContext.Provider value={openViewer}>
      {children}
      {selection
        ? (
          <ImageViewerModal
            key={selection.image.src}
            image={selection.image}
            trigger={selection.trigger}
            onExited={dismissViewer}
          />
        )
        : null}
    </ArticleImageViewerContext.Provider>
  );
}
