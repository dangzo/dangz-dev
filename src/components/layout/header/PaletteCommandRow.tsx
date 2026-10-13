'use client';

import Link from 'next/link';
import type { PaletteCommand } from './paletteCommands';

type PaletteCommandRowProps = Readonly<{
  command: PaletteCommand;
  className: string;
  elementRef: (element: HTMLAnchorElement | HTMLButtonElement | null) => void;
  onSelect: () => void;
  onClose: () => void;
  onToggleTheme: () => void;
}>;

export default function PaletteCommandRow({
  command,
  className,
  elementRef,
  onSelect,
  onClose,
  onToggleTheme,
}: PaletteCommandRowProps) {
  const itemProps = { className, ref: elementRef, onMouseEnter: onSelect, onFocus: onSelect };
  const label = (
    <span className="font-medium text-main-light dark:text-main-dark">
      <span aria-hidden="true" className="mr-2 font-mono text-main-light/60 dark:text-main-dark/60">{'>'}</span>
      {command.label}
    </span>
  );

  if (command.kind === 'theme') {
    return (
      <button
        {...itemProps}
        type="button"
        onClick={() => {
          onToggleTheme();
          onClose();
        }}
      >
        {label}
      </button>
    );
  }

  if (command.kind === 'navigation') {
    return (
      <Link {...itemProps} href={command.href} onClick={onClose}>
        {label}
      </Link>
    );
  }

  return (
    <a
      {...itemProps}
      {...command.analytics}
      href={command.href}
      target={command.href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      download={command.download}
      onClick={onClose}
    >
      {label}
    </a>
  );
}
