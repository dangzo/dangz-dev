'use client';

import { Button, Heading, Text } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <h1
          className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-600 mb-4"
        >
          404
        </h1>
        <Heading as="h2">
          Page Not Found
        </Heading>

        <Text size="large" className="max-w-md mx-auto">
          Looks like this page wandered off into the digital void. Let's get you back on track.
        </Text>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button type="primary" size="large" to="/">
          Back Home
        </Button>
        <Button type="ghost" size="large" to="/blog">
          View Blog
        </Button>
      </div>

      <Text className="mt-16" size="small">
        ✨ Error Code: 404 - The page you're looking for doesn't exist
      </Text>
    </div>
  );
}
