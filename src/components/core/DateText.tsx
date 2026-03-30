import { Text } from '@/components/core';

interface DateTextProps extends React.HTMLAttributes<HTMLElement> {
  date?: string;
}

export default function DateText({ date, className }: DateTextProps) {
  if (!date) {
    return null;
  }

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Text className={className} size="small">
      <time dateTime={date} className="italic">
        {formattedDate}
      </time>
    </Text>
  );
}
