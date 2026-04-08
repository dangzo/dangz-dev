import { createImageUrlBuilder } from '@sanity/image-url';
import client from '@/sanity/client';

const builder = createImageUrlBuilder(client);

export function urlFor(source?: Parameters<typeof builder.image>[0]) {
  return source ? builder.image(source) : undefined;
}