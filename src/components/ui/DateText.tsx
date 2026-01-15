export default function DateText({ date }: { date?: string }) {
  if (!date) {
    return null;
  }

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return <time dateTime={date}>{formattedDate}</time>;
}
