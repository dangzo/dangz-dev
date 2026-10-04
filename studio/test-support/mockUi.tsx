import type { ElementType, ReactNode } from 'react';

type BoxProps = Readonly<{ children?: ReactNode; as?: ElementType; role?: string }>;

function Box({ children, as: Tag = 'div', role }: BoxProps) {
  return (
    <Tag role={role}>{children}</Tag>
  );
}

export const Stack = Box;
export const Card = Box;
export const Text = Box;

export function Button({ text, onClick }: Readonly<{ text: string; onClick: () => void }>) {
  return (
    <button onClick={onClick}>{text}</button>
  );
}

export function Spinner() {
  return (
    <span>Spinner</span>
  );
}
