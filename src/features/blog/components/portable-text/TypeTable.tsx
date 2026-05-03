import { Table } from '@/components/ui';

interface TypeTableProps {
  value: {
    rows: {
      _key?: string;
      cells: string[];
    }[];
  };
}

export default function TypeTable({ value }: TypeTableProps) {
  return <Table value={value} />;
}
