import React from 'react';

const StatsCard = ({ label, value, color, animationDelay = 0 }) => {
  return (
    <div 
      className="stat-card p-5 flex flex-col justify-center group" 
      style={{ 
        animationDelay: `${animationDelay}ms`, 
        animationFillMode: 'both',
        borderLeft: color ? `4px solid ${color}` : undefined
      }}
    >
      <div>
        <p className="text-2xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">{value}</p>
        <p className="text-[12px] font-medium text-slate-500 mt-1 uppercase tracking-wider group-hover:text-slate-600 transition-colors">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
