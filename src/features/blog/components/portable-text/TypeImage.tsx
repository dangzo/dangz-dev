import { Img, type ImgProps } from '@/components/ui';

interface TypeImageProps {
  value: ImgProps['source'] & {
    alt?: string;
    width?: number;
    height?: number;
  };
}

export default function TypeImage({ value }: TypeImageProps) {
  if (!value) {
    return null;
  }

  return (
    <Img
      source={value}
      alt={value.alt || ' '}
      width={value.width || 500}
      height={value.height || 500}
      loading='lazy'
      className="mx-auto my-6 rounded-md object-cover"
    />
  );
}
