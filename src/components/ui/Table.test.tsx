import { render, screen, within } from '@testing-library/react';

import Table from './Table';

describe('Table', () => {
  it('renders each row and cell from the Sanity table value', () => {
    render(
      <Table
        value={{
          rows: [
            { _key: 'r1', cells: ['Alpha', 'Beta'] },
            { cells: ['Gamma', 'Delta'] },
          ],
        }}
      />,
    );

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(2);

    expect(within(rows[0]).getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
    expect(within(rows[0]).getByRole('cell', { name: 'Beta' })).toBeInTheDocument();
    expect(within(rows[1]).getByRole('cell', { name: 'Gamma' })).toBeInTheDocument();
    expect(within(rows[1]).getByRole('cell', { name: 'Delta' })).toBeInTheDocument();
  });

  it('renders markdown inside a cell', () => {
    render(
      <Table
        value={{
          rows: [{ cells: ['**Bold label** and text'] }],
        }}
      />,
    );

    expect(screen.getByText('Bold label')).toBeInTheDocument();
    expect(screen.getByText(/and text/)).toBeInTheDocument();
  });
});
