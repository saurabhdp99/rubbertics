import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  User,
  Printer,
  Download,
  Filter,
  TrendingUp,
  Target,
  Users,
  Activity,
  Eye
} from 'lucide-react';
import { useERPStore } from '../store/erpStore';
import StatsCard from '../components/common/StatsCard';
import WeeklyMouldingPlanModal from '../components/WeeklyMouldingPlanModal';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function WeeklyMouldingPlanPage() {
  const { weeklyPlans, openWeeklyModal } = useERPStore();
  const [searchTerm, setSearchTerm] = useState('');

  const calculateAchievement = (plan, actual) => {
    if (!plan || plan === 0) return 0;
    return ((actual / plan) * 100).toFixed(1);
  };

  const getAchievementColor = (percent) => {
    if (percent >= 95) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (percent >= 85) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (percent >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const filteredPlans = weeklyPlans.filter(p => 
    p.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up p-6">
      {/* Header Info Banner */}
      <div className="glass-card rounded-2xl p-6 mb-8 border border-white/40 shadow-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekly Plan No</p>
            <p className="text-xl font-bold text-slate-800">#49 / 2025</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Range</p>
            <p className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-500" />
              24 Nov - 29 Nov 2025
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format / Revision</p>
            <p className="text-sm font-bold text-slate-700">DBP/F/83 (Rev. 01)</p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
              <Printer size={18} />
            </button>
            <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Weekly Total Target"
          value="4,850"
          icon={Target}
          color="#10b981"
          bg="rgba(16,185,129,0.1)"
          border="rgba(16,185,129,0.2)"
        />
        <StatsCard
          label="Current Actual Qty"
          value="4,212"
          icon={Activity}
          color="#6366f1"
          bg="rgba(99,102,241,0.1)"
          border="rgba(99,102,241,0.2)"
        />
        <StatsCard
          label="Avg Achievement %"
          value="86.8%"
          icon={TrendingUp}
          color="#f59e0b"
          bg="rgba(245,158,11,0.1)"
          border="rgba(245,158,11,0.2)"
        />
        <StatsCard
          label="Active Operators"
          value="12"
          icon={Users}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.1)"
          border="rgba(139,92,246,0.2)"
        />
      </div>

      {/* Main Table Section */}
      <div className="glass-card rounded-3xl border border-slate-200/60 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search part, operator or work order..."
                className="w-80 h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Filter className="absolute left-4 top-3.5 text-slate-400" size={16} />
            </div>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
            Showing <span className="text-slate-900 font-bold">{filteredPlans.length}</span> Production Records
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[2000px]">
            <thead>
              {/* Primary Header */}
              <tr className="bg-slate-50">
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center sticky left-0 z-20 bg-slate-50 w-16">Sr.No</th>
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-left sticky left-16 z-20 bg-slate-50 w-80">Part Name / No.</th>
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center w-24">Machine Size</th>
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center w-32">Work Order No</th>
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center w-20">Cavity</th>
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center w-24">Metrics</th>
                
                {DAYS.map(day => (
                  <th key={day} colSpan={2} className="p-3 text-[11px] font-bold text-emerald-700 uppercase tracking-widest border border-slate-200 text-center bg-emerald-50/50">
                    {day}
                  </th>
                ))}
                
                <th rowSpan={3} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center w-32 bg-slate-50">Total Qty</th>
              </tr>
              <tr className="bg-white">
                {DAYS.map(day => (
                  <React.Fragment key={`${day}-shifts`}>
                    <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center bg-slate-50/30">Day</th>
                    <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 text-center bg-slate-900/5">Night</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((part, index) => {
                const metrics = [
                  { label: 'PLAN', color: 'bg-blue-50 text-blue-700', key: 'plan' },
                  { label: 'ACTUAL', color: 'bg-emerald-50 text-emerald-700', key: 'actual' },
                  { label: 'OPERATOR', color: 'bg-indigo-50 text-indigo-700', key: 'operator' },
                  { label: 'ACHIEVED %', color: 'bg-amber-50 text-amber-700', key: 'percent' }
                ];

                return metrics.map((metric, mIndex) => {
                  const isFirstMetric = mIndex === 0;
                  const isLastMetric = mIndex === metrics.length - 1;

                  return (
                    <tr key={`${part.id}-${metric.label}`} className={`hover:bg-slate-50/30 transition-colors ${isLastMetric ? 'border-b-2 border-slate-200' : ''} group`}>
                      {isFirstMetric && (
                        <>
                          <td rowSpan={4} className="p-4 text-sm font-bold text-slate-400 text-center border-x border-slate-200 sticky left-0 z-10 bg-white group-hover:bg-slate-50/30">
                            {index + 1}
                          </td>
                          <td rowSpan={4} className="p-4 border-x border-slate-200 sticky left-16 z-10 bg-white group-hover:bg-slate-50/30">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-black text-slate-800 text-[14px] leading-tight mb-1">{part.partName}</p>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{part.partNo}</p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openWeeklyModal('view', part)}
                                  className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                >
                                  <Eye size={14} />
                                  View Details
                                </button>
                              </div>
                            </div>
                          </td>
                          <td rowSpan={4} className="p-4 text-sm font-semibold text-slate-600 text-center border-x border-slate-200">
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-black">{part.machineSize}</span>
                          </td>
                          <td rowSpan={4} className="p-4 text-sm font-mono font-bold text-slate-500 text-center border-x border-slate-200">
                            {part.workOrderNo}
                          </td>
                          <td rowSpan={4} className="p-4 text-sm font-black text-emerald-600 text-center border-x border-slate-200">
                            {part.cavity}
                          </td>
                        </>
                      )}
                      
                      <td className={`p-2 text-[10px] font-black text-center border border-slate-200 ${metric.color}`}>
                        {metric.label}
                      </td>

                      {DAYS.map(day => {
                        const dayData = part.schedule[day];
                        const dayValue = metric.key === 'percent' 
                          ? calculateAchievement(dayData.day.plan, dayData.day.actual) + '%'
                          : dayData.day[metric.key];
                        
                        const nightValue = metric.key === 'percent'
                          ? calculateAchievement(dayData.night.plan, dayData.night.actual) + '%'
                          : dayData.night[metric.key];

                        return (
                          <React.Fragment key={`${part.id}-${day}-${metric.label}`}>
                            <td className={`p-2 text-[12px] font-bold text-center border border-slate-200 ${metric.key === 'percent' ? getAchievementColor(parseFloat(dayValue)) : 'text-slate-700'}`}>
                              {metric.key === 'operator' ? (
                                <span className="flex items-center justify-center gap-1 text-[11px]">
                                  <User size={10} className="text-slate-400" />
                                  {dayValue}
                                </span>
                              ) : dayValue}
                            </td>
                            <td className={`p-2 text-[12px] font-bold text-center border border-slate-200 bg-slate-900/[0.02] ${metric.key === 'percent' ? getAchievementColor(parseFloat(nightValue)) : 'text-slate-600'}`}>
                              {metric.key === 'operator' ? (
                                <span className="flex items-center justify-center gap-1 text-[11px]">
                                  <User size={10} className="text-slate-300" />
                                  {nightValue}
                                </span>
                              ) : nightValue}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {isFirstMetric && (
                        <td rowSpan={4} className="p-4 bg-slate-50/50 border-x border-slate-200 text-center">
                          <div className="flex flex-col gap-2 items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
                              <span className="text-sm font-black text-emerald-700">88%</span>
                              <svg className="absolute -rotate-90 w-16 h-16">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  strokeDasharray={176}
                                  strokeDashoffset={176 * (1 - 0.88)}
                                  className="text-emerald-500"
                                />
                              </svg>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Avg</div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span>95%+ Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
              <span>70-95% Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
              <span>Below 70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WeeklyMouldingPlanModal />
    </div>
  );
}
