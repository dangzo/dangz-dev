import { ReactNode } from 'react';
import { Text } from '@/components/ui';

interface ListItemNumberProps {
  children: ReactNode;
}

export default function ListItemNumber({ children }: ListItemNumberProps) {
  return <li><Text className="mt-0! mb-2! sm:mb-4!">{children}</Text></li>;
}
