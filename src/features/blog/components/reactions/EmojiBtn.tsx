import { Emoji } from '@/components/ui';

interface EmojiBtnProps {
  emoji: string;
  name: string;
  onClick?: () => void;
  disabled?: boolean;
}

const EmojiBtn = ({ emoji, name, onClick, disabled = false }: EmojiBtnProps) => {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xl sm:text-3xl transition-colors hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      aria-label={name}
      onClick={onClick}
      disabled={disabled}
    >
      <Emoji emoji={emoji} label={name} />
    </button>
  );
};

export default EmojiBtn;