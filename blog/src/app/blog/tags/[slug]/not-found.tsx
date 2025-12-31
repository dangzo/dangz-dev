import { Heading, Text } from '@/components/ui';

const NotFound = () => {
  return (
    <div>
      <Heading as="h2" className="mb-4">Tag Not Found</Heading>
      <Text className="text-lg text-gray-600">
        No posts matching the tag you are looking for exist.
      </Text>
    </div>
  );
};

export default NotFound;
