import { Text, Heading } from '@/components/ui';

async function TagsSidebar() {
  return (
    <aside
      className="
        p-4 mb-8 w-full max-w-[256px]
        rounded-md border-2 border-border-light dark:border-border-dark
        bg-background-secondary-light dark:bg-background-secondary-dark
      "
    >
      <Heading as="h4" className="mb-4 text-2xl font-semibold">All tags</Heading>
      <ul className="list-disc list-inside space-y-2 text-secondary-light dark:text-secondary-dark text-sm">
        <li><Text size="small" className="inline">React (8)</Text></li>
        <li><Text size="small" className="inline">TypeScript (3)</Text></li>
        <li><Text size="small" className="inline">UX/IX (2)</Text></li>
        <li><Text size="small" className="inline">Frontend (5)</Text></li>
      </ul>
    </aside>
  );
};

export default TagsSidebar;
