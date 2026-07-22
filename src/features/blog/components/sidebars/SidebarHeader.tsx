import { Heading, Text } from '@/components/ui';

interface SidebarHeaderProps {
  title: string;
  count?: number;
  singular: string;
  plural: string;
}

export default function SidebarHeader({
  title,
  count = 0,
  singular,
  plural,
}: Readonly<SidebarHeaderProps>) {
  return (
    <>
      <Heading as="h3" className="mb-1! text-lg font-semibold">
        {title}
      </Heading>

      {count > 0 && (
        <Text size="x-small" className="mb-0! uppercase tracking-wider">
          {count} {count === 1 ? singular : plural}
        </Text>
      )}
    </>
  );
}
