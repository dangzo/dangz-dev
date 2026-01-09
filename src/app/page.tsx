import { Text, Heading } from '@/components/ui';

export default async function HomePage() {
  return (
    <article>
      <div className="flex justify-center flex-col items-center text-center gap-6 mt-[calc(20vh)] mb-20 px-4">
        <Heading as="h1" className="text-7xl">
          Hi, I'm Daniele
        </Heading>
        <Text className="max-w-xl text-xl text-gray-600 dark:text-gray-300">
          This is where I document my journey on software engineering, share insights and write about things I enjoy.
        </Text>
      </div>
    </article>
  );
}
