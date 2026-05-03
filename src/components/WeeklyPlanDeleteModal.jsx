import React from 'react';
import { useERPStore } from '../store/erpStore';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function WeeklyPlanDeleteModal() {
  const { isWeeklyDeleteConfirmOpen, weeklyPlanToDelete, closeWeeklyDeleteConfirm, deleteWeeklyPlan } = useERPStore();

  if (!isWeeklyDeleteConfirmOpen || !weeklyPlanToDelete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={e => e.target === e.currentTarget && closeWeeklyDeleteConfirm()}
    >
      <div
        className="fade-in w-full max-w-md rounded-3xl overflow-hidden bg-white shadow-2xl"
        style={{
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Delete Plan</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Permanent Action</p>
            </div>
          </div>
          <button onClick={closeWeeklyDeleteConfirm}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <div className="p-5 rounded-2xl mb-6 bg-red-50/50 border border-red-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Part:</p>
            <p className="text-red-600 font-black text-lg">{weeklyPlanToDelete.partName}</p>
            <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-wider">{weeklyPlanToDelete.partNo}</p>
          </div>

          <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
            Are you sure you want to delete this weekly moulding plan? This will remove all production schedules and achievement data for this part.
          </p>

          <div className="flex gap-4">
            <button
              onClick={closeWeeklyDeleteConfirm}
              className="flex-1 py-3.5 text-sm font-black rounded-2xl text-slate-500 border border-slate-200 hover:text-slate-800 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteWeeklyPlan(weeklyPlanToDelete.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-black rounded-2xl text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <Trash2 size={18} />
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
