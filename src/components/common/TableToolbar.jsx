import React from 'react';
import { Search, Download, Plus, Filter } from 'lucide-react';

const TableToolbar = ({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder, 
  onExport, 
  onAdd, 
  onFilter,
  addButtonText = 'Add Entry',
  showFilter = false,
  theme = 'emerald'
}) => {
  const themeConfig = {
    emerald: {
      focusColor: 'text-emerald-500',
      focusBorder: 'focus:border-emerald-500/50',
      focusShadow: 'focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      btnShadow: 'shadow-emerald-500/30'
    },
    indigo: {
      focusColor: 'text-indigo-500',
      focusBorder: 'focus:border-indigo-500/50',
      focusShadow: 'focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700',
      btnShadow: 'shadow-indigo-500/30'
    }
  };

  const config = themeConfig[theme] || themeConfig.emerald;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full min-w-0 group">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:${config.focusColor} transition-colors`} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className={`w-full pl-11 pr-4 py-3 text-sm input-glow rounded-xl ${config.focusBorder} ${config.focusShadow}`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full xl:w-auto shrink-0">
          {showFilter && (
            <button 
              onClick={onFilter}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all flex-1 xl:flex-none"
            >
              <Filter size={18} />
              Filters
            </button>
          )}
          <button 
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all flex-1 xl:flex-none"
          >
            <Download size={18} />
            Export
          </button>
          <button 
            onClick={onAdd}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg ${config.btnShadow} ${config.btnBg} transition-all flex-1 xl:flex-none`}
          >
            <Plus size={18} strokeWidth={2.5} />
            {addButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableToolbar;
