import { Text } from '@/components/ui';

export default function BlogTagline({ description }: Readonly<{ description?: string }>) {
  return (
    <Text className="max-w-2xl">
      {description ?? 'Frontend engineering, AI-assisted development, and lessons from building across the stack.'}
    </Text>
  );
}
