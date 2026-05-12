import React from 'react';
import { Table } from '@heroui/react';

const DataTable = ({ columns, data, minWidth = '1200px', emptyMessage = 'No data available' }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl pb-4">
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Data table"
            className="min-w-[1400px]"
            style={{ minWidth }}
          >
            <Table.Header>
              {columns.map((column, index) => (
                <Table.Column
                  key={index}
                  className="text-xs font-bold text-slate-500 uppercase tracking-widest"
                  style={column.align === 'center' ? { textAlign: 'center' } : column.align === 'right' ? { textAlign: 'right' } : {}}
                >
                  <div className={`flex items-center ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''} gap-2`}>
                    {column.icon && <column.icon size={14} />}
                    {column.header}
                  </div>
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body items={data} renderEmptyState={() => (
              <div className="py-12 text-center text-slate-400">
                {emptyMessage}
              </div>
            )}>
              {(row) => (
                <Table.Row key={row.id || row._id || JSON.stringify(row)} className="text-[13px]">
                  {columns.map((column, colIndex) => (
                    <Table.Cell
                      key={colIndex}
                      style={column.align === 'center' ? { textAlign: 'center' } : column.align === 'right' ? { textAlign: 'right' } : {}}
                    >
                      {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
};

export default DataTable;
