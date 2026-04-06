import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import client from '@/sanity/client';

export default function useSanityImageUrl() {
  // Create an image URL builder using the client
  const builder = createImageUrlBuilder(client);

  function urlFor(source?: SanityImageSource) {
    return builder.image(source || '');
  }

  return {
    urlFor,
  };
}
