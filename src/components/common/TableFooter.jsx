import React from 'react';

const TableFooter = ({ totalEntries, additionalInfo }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-4 border-t border-slate-100">
      <div className="text-sm font-medium text-slate-400">
        Showing <span className="text-slate-800 font-bold px-1">{totalEntries}</span> entries
      </div>
      {additionalInfo && (
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {additionalInfo}
        </p>
      )}
    </div>
  );
};

export default TableFooter;
