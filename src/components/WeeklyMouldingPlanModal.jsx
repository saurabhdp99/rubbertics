import React, { useState, useEffect } from 'react';
import { useERPStore } from '../store/erpStore';
import { X, Package, Calendar, Hash, Layers, User, ChevronRight, ChevronLeft } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function DisplayField({ label, value, icon: Icon, isDark = false }) {
  return (
    <div className="flex flex-col gap-2 relative">
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
        {Icon && <Icon size={12} className={isDark ? "text-indigo-400" : "text-emerald-500"} />}
        {label}
      </label>
      <div className={`px-4 py-3 text-[13px] font-bold rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 shadow-sm'}`}>
        {value || '---'}
      </div>
    </div>
  );
}

export default function WeeklyMouldingPlanModal() {
  const { isWeeklyModalOpen, selectedWeeklyPlan, closeWeeklyModal } = useERPStore();
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    if (isWeeklyModalOpen) {
      setActiveDayIndex(0);
    }
  }, [isWeeklyModalOpen]);

  if (!isWeeklyModalOpen || !selectedWeeklyPlan) return null;

  const currentDay = DAYS[activeDayIndex];
  const daySchedule = selectedWeeklyPlan.schedule[currentDay];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 modal-backdrop"
      onClick={e => e.target === e.currentTarget && closeWeeklyModal()}
    >
      <div
        className="modal-content w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[24px] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.15)] border border-slate-200 bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-emerald-50 border border-emerald-100"
            >
              <Package size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Production Details</h2>
              <p className="text-[10px] font-black text-emerald-600 mt-0.5 uppercase tracking-widest">{selectedWeeklyPlan.partNo}</p>
            </div>
          </div>
          <button
            onClick={closeWeeklyModal}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-white">
          <div className="space-y-10">
            
            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Part Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DisplayField label="Part Name" value={selectedWeeklyPlan.partName} icon={Package} />
                <DisplayField label="Part Number" value={selectedWeeklyPlan.partNo} icon={Hash} />
                <DisplayField label="Machine Size" value={selectedWeeklyPlan.machineSize} icon={Layers} />
                <DisplayField label="Work Order No" value={selectedWeeklyPlan.workOrderNo} icon={Hash} />
                <DisplayField label="Cavity" value={selectedWeeklyPlan.cavity} icon={Layers} />
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-indigo-500 pl-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Production Schedule</h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {DAYS.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDayIndex(idx)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDayIndex === idx ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-[24px] p-8 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Calendar size={120} className="text-slate-900" />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeDayIndex === 0}
                    className="p-2 rounded-full hover:bg-white transition-all disabled:opacity-20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <h4 className="text-xl font-black text-indigo-600 uppercase tracking-[0.2em]">{currentDay}</h4>
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex(prev => Math.min(DAYS.length - 1, prev + 1))}
                    disabled={activeDayIndex === DAYS.length - 1}
                    className="p-2 rounded-full hover:bg-white transition-all disabled:opacity-20"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Day Shift */}
                  <div className="space-y-6 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day Shift</span>
                    </div>
                    <DisplayField label="Plan Qty" value={daySchedule.day.plan} />
                    <DisplayField label="Actual Qty" value={daySchedule.day.actual} />
                    <DisplayField label="Operator Name" value={daySchedule.day.operator} icon={User} />
                  </div>

                  {/* Night Shift */}
                  <div className="space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm shadow-slate-900/20">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Night Shift</span>
                    </div>
                    <DisplayField label="Plan Qty" value={daySchedule.night.plan} isDark={true} />
                    <DisplayField label="Actual Qty" value={daySchedule.night.actual} isDark={true} />
                    <DisplayField label="Operator Name" value={daySchedule.night.operator} icon={User} isDark={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={closeWeeklyModal}
            className="px-8 py-3 text-sm font-black rounded-xl text-slate-600 bg-white border border-slate-200 hover:text-slate-800 hover:shadow-md transition-all outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
