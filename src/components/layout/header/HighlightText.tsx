import { Fragment } from 'react';

type Props = {
  text: string;
  query: string;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const HighlightText = ({ text, query }: Props) => {
  const terms = Array.from(
    new Set(
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length >= 2),
    ),
  );

  if (!text || terms.length === 0) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = terms.includes(part.toLowerCase());
        if (!isMatch) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <mark
            key={`${part}-${index}`}
            className="rounded-sm bg-primary-100 px-0.5 text-main-light dark:bg-primary-900/55 dark:text-main-dark"
          >
            {part}
          </mark>
        );
      })}
    </>
  );
};

export default HighlightText;
