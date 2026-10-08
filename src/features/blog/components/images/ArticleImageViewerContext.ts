'use client';

import { createContext } from 'react';

export type ArticleImageDescriptor = Readonly<{
  src: string;
  alt: string;
  caption?: string;
}>;

type OpenImageViewer = (image: ArticleImageDescriptor, trigger: HTMLButtonElement) => void;

export const ArticleImageViewerContext = createContext<OpenImageViewer | null>(null);
