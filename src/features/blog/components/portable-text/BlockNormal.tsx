import { ReactNode } from 'react';
import { Text } from '@/components/ui';

interface BlockNormalProps {
  children: ReactNode;
}

function BlockNormal({ children }: BlockNormalProps) {
  return <Text>{children}</Text>;
}

export default BlockNormal;
