import React from 'react';

const StatsCard = ({ label, value, icon: Icon, color, bg, border, animationDelay = 0 }) => {
  return (
    <div 
      className="stat-card p-5 flex flex-col gap-3 group" 
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="stat-card-icon-wrapper p-2.5 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${bg}, rgba(0,0,0,0))`,
            border: `1px solid ${border}`
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="mt-1">
        <p className="text-2xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">{value}</p>
        <p className="text-[12px] font-medium text-slate-500 mt-1 uppercase tracking-wider group-hover:text-slate-600 transition-colors">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
