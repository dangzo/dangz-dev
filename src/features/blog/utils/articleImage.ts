import type { ImgProps } from '@/components/ui/Img';
import type { ArticleImageDescriptor } from '../components/images/ArticleImageViewerContext';
import { urlFor } from '@/utils/image';

export function getArticleImage(source: ImgProps['source'], alt: string, caption?: string): ArticleImageDescriptor | undefined {
  if (!source) {
    return undefined;
  }

  try {
    const src = urlFor(source)?.ignoreImageParams().auto('format').url();

    return src ? { src, alt, caption } : undefined;
  } catch {
    // A missing or invalid CMS asset must not produce an empty interactive trigger.
    return undefined;
  }
}
