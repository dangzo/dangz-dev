import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Text, Button, Heading } from '@/components/ui';
import TopTags from '@/components/home/TopTags';

export const metadata: Metadata = {
  title: 'Daniele Gazzelloni | Frontend Engineering Blog',
};

export default function HomePage() {
  return (
    <article>
      <div className="flex justify-center flex-col items-center text-center gap-4 md:gap-6 mt-[calc(8vh)] md:mt-[calc(18vh)] mb-10 md:mb-20 px-4">
        <Heading as="h1" className="text-4xl md:text-5xl lg:text-7xl">
          Hi, I'm Daniele
        </Heading>
        <Text className="max-w-xl" size="large">
          This is where I document my journey on software engineering,
          share insights and write about things I enjoy.
        </Text>

        <Button to="/blog" type="primary" size="large">
          Let's dive in
        </Button>

        <div className="flex flex-row items-center gap-2 md:gap-3 mt-6 md:mt-10 flex-wrap justify-center">
          <Suspense>
            <TopTags />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
