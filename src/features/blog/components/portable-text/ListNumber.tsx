import { ReactNode } from 'react';

interface ListNumberProps {
  children: ReactNode;
}

export default function ListNumber({ children }: ListNumberProps) {
  return <ol className="list-decimal ml-4 sm:mt-6! sm:mb-10!">{children}</ol>;
}
