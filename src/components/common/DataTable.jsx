import React from 'react';

const DataTable = ({ columns, data, minWidth = '1200px', emptyMessage = 'No data available' }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl pb-4">
      <div className="overflow-x-auto px-4 pt-4">
        <table className="w-full modern-table text-sm" style={{ minWidth }}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-y border-slate-200 ${
                    index === 0 ? 'border-l rounded-l-xl' : ''
                  } ${index === columns.length - 1 ? 'border-r rounded-r-xl' : ''} ${column.width ? column.width : ''}`}
                  style={column.align === 'center' ? { textAlign: 'center' } : column.align === 'right' ? { textAlign: 'right' } : {}}
                >
                  <div className={`flex items-center ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''} gap-2`}>
                    {column.icon && <column.icon size={14} />}
                    {column.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-[13px] hover:bg-slate-50/50">
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-4 border-y border-slate-100 ${
                        colIndex === 0 ? 'rounded-tl-xl rounded-bl-xl' : ''
                      } ${colIndex === columns.length - 1 ? 'rounded-tr-xl rounded-br-xl' : ''}`}
                      style={column.align === 'center' ? { textAlign: 'center' } : column.align === 'right' ? { textAlign: 'right' } : {}}
                    >
                      {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
