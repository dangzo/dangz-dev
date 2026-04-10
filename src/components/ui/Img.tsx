import Image, { type ImageProps } from 'next/image';
import useSanityImageUrl from '@/hooks/useSanityImageUrl';
import type { SanityImageSource } from '@sanity/image-url';

export interface ImgProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> {
  source?: SanityImageSource;
  width: number;
  height: number;
  alt?: string;
  blurDataURL?: string;
}

export default function Img({ source, alt, height, width, blurDataURL, ...props }: ImgProps) {
  const { urlFor } = useSanityImageUrl();

  const sourceUrl = urlFor(source)?.url();

  if (!sourceUrl) {
    return null;
  }

  return (
    <Image
      src={sourceUrl}
      alt={alt || '(Image)'}
      width={width}
      height={height}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      {...props}
    />
  );
}
