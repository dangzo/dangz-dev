import { Img, type ImgProps } from '@/components/ui';

const MAX_IMAGE_WIDTH = 930;
const MAX_IMAGE_HEIGHT = 665;

interface TypeImageProps {
  value: ImgProps['source'] & {
    caption?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

export default function TypeImage({ value }: Readonly<TypeImageProps>) {
  if (!value) {
    return null;
  }

  const hasCaption = typeof value.caption === 'string' && value.caption.trim().length > 0;
  const width = Math.min(value.width || MAX_IMAGE_WIDTH, MAX_IMAGE_WIDTH);
  const height = Math.min(value.height || MAX_IMAGE_HEIGHT, MAX_IMAGE_HEIGHT);

  return (
    <figure className="my-6">
      <Img
        source={value}
        alt={value.alt || ' '}
        width={width}
        height={height}
        loading='lazy'
        className="mx-auto rounded-md object-cover"
      />

      {hasCaption
        ? (
          <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 italic font-semibold">
            {value.caption}
          </figcaption>
        )
        : null
      }
    </figure>
  );
}
