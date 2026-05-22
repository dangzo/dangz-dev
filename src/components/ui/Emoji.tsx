import type { Reaction } from '@/types/sanity.types';

interface EmojiProps extends React.HTMLAttributes<HTMLSpanElement> {
  emoji: NonNullable<Reaction['emoji']>;
  label?: string;
}

const Emoji = ({ emoji, label, ...rest }: EmojiProps) => (
  <span role="img" aria-label={label} aria-hidden={!label} {...rest}>
    {emoji}
  </span>
);

export default Emoji;
