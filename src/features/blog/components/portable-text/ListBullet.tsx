import { ReactNode } from 'react';

interface ListBulletProps {
  children: ReactNode;
}

export default function ListBullet({ children }: ListBulletProps) {
  return <ul className="list-disc ml-4 sm:mt-6! sm:mb-10!">{children}</ul>;
}
