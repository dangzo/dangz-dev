import { ReactNode } from 'react';
import { Text } from '@/components/ui';

interface BlockNormalProps {
  children: ReactNode;
}

function BlockNormal({ children }: BlockNormalProps) {
  return (
    <Text className="text-base! leading-7!">{children}</Text>
  );
}

export default BlockNormal;
