
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TableRow {
  _key?: string;
  cells: string[];
}

interface TableProps {
  value: {
    rows: TableRow[];
  };
}

const Table = ({ value }: TableProps) => {
  const { rows } = value;
  
  return (
    <div className="my-8 overflow-x-auto">
      <table
        className="
          min-w-full border-collapse border
          border-gray-300 bg-neutral-50/50 
          dark:border-gray-700 dark:bg-neutral-800/10
        "
      >
        <tbody>
          {rows.map((row: TableRow, rowIndex: number) => (
            <tr key={row._key || rowIndex}>
              {row.cells.map((cell: string, cellIndex: number) => (
                <td
                  key={cellIndex}
                  className="
                    border border-gray-300 dark:border-gray-700
                    text-secondary-light dark:text-secondary-dark font-body
                    p-2! align-top [&_p]:my-0 [&_ul]:my-0 [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-accent-light/10 [&_code]:px-1 [&_code]:py-0.5 dark:[&_code]:bg-neutral-100/10
                  "
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cell}
                  </ReactMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;