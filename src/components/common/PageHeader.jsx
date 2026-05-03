import React from 'react';
import { RefreshCw } from 'lucide-react';

const PageHeader = ({ icon: Icon, title, description, showLiveSync = false, theme = 'emerald' }) => {
  const themeConfig = {
    emerald: {
      iconBg: 'rgba(16,185,129,0.1)',
      iconBorder: 'border-emerald-500/20',
      iconColor: 'text-emerald-600',
      iconShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
    },
    indigo: {
      iconBg: 'rgba(99,102,241,0.1)',
      iconBorder: 'border-indigo-500/20',
      iconColor: 'text-indigo-600',
      iconShadow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(67,56,202,0.05))'
    }
  };

  const config = themeConfig[theme] || themeConfig.emerald;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.iconShadow} ${config.iconBorder} border bg-white`}
          style={{ background: config.gradient }}
        >
          <Icon size={28} className={`${config.iconColor} drop-shadow-sm`} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      {showLiveSync && (
        <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse" />
            Live Sync
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:shadow-sm transition-all group">
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
