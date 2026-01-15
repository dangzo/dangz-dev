import Image from 'next/image';
import useSanityImageUrl from '@/hooks/useSanityImageUrl';
import type { SanityImageSource } from '@sanity/image-url';

interface ImgProps extends React.HTMLAttributes<HTMLImageElement> {
  source?: SanityImageSource;
  width: number;
  height: number;
  alt?: string;
}

export default function Img({ source, alt, height, width, ...props }: ImgProps) {
  const { urlFor } = useSanityImageUrl();

  return (
    <Image
      src={
        urlFor(source)
          .width(width)
          .height(height)
          .url()
      }
      alt={alt || '(Image)'}
      width={width}
      height={height}
      {...props}
    />
  );
}
