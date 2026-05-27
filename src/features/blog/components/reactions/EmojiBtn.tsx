import { Emoji } from '@/components/ui';

interface EmojiBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  name: string;
  onClick?: () => void;
  isPending?: boolean;
}

const EmojiBtn = ({ emoji, name, onClick, isPending = false, ...props }: EmojiBtnProps) => {
  const buttonClasses = [
    'inline-flex items-center justify-center rounded-full px-3 py-1 text-xl sm:text-3xl',
    'cursor-pointer transition-[background-color,box-shadow] duration-200 ease-out hover:bg-secondary-light/10 dark:hover:bg-secondary-dark/20',
    isPending
      ? 'emoji-bounce-two bg-secondary-light/20 dark:bg-secondary-dark/30 shadow-[0_0_0_6px_rgba(120,119,198,0.18)] dark:shadow-[0_0_0_6px_rgba(255,255,255,0.12)]'
      : '',
  ].join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      aria-label={name}
      onClick={onClick}
      aria-busy={isPending}
      {...props}
    >
      <Emoji emoji={emoji} label={name} />
    </button>
  );
};

export default EmojiBtn;