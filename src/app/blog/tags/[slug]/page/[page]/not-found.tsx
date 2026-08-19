import { Heading, Text } from '@/components/ui';

const NotFound = () => {
  return (
    <div>
      <Heading as="h2" className="mb-4">Page Not Found</Heading>
      <Text className="text-lg text-gray-600">
        That page doesn&apos;t exist for this tag. Try going back to its first page of posts.
      </Text>
    </div>
  );
};

export default NotFound;
