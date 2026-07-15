import { Img, type ImgProps } from '@/components/ui';

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

  return (
    <figure className="my-6">
      <Img
        source={value}
        alt={value.alt || ' '}
        width={value.width || 500}
        height={value.height || 500}
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
