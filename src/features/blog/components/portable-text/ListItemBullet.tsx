import { ReactNode } from 'react';
import { Text } from '@/components/ui';

interface ListItemBulletProps {
  children: ReactNode;
}

export default function ListItemBullet({ children }: ListItemBulletProps) {
  return <li><Text className="mt-0! mb-2! sm:mb-4!">{children}</Text></li>;
}
