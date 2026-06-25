import React from 'react';
import { useERPStore } from '../store/erpStore';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal() {
  const { isDeleteConfirmOpen, orderToDelete, closeDeleteConfirm, deleteOrder } = useERPStore();

  if (!isDeleteConfirmOpen || !orderToDelete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={e => e.target === e.currentTarget && closeDeleteConfirm()}
    >
      <div
        className="fade-in w-full max-w-md rounded-2xl overflow-hidden bg-white"
        style={{
          border: '1px solid rgba(239,68,68,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Delete Order</h3>
              <p className="text-xs text-slate-500">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={closeDeleteConfirm}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-5">
          <div className="p-4 rounded-xl mb-4"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-sm text-slate-600 mb-2">You are about to delete:</p>
            <p className="text-emerald-600 font-semibold">{orderToDelete.poNo}</p>
            <p className="text-slate-500 text-sm mt-1">{orderToDelete.partyName}</p>
            <p className="text-slate-400 text-xs mt-1 truncate">{orderToDelete.productName}</p>
          </div>

          <p className="text-sm text-slate-600 mb-5">
            Are you sure you want to permanently delete this sale order? All associated data will be removed.
          </p>

          <div className="flex gap-3">
            <button
              onClick={closeDeleteConfirm}
              className="flex-1 py-2.5 text-sm rounded-xl text-slate-600 border border-slate-200 hover:text-slate-800 hover:bg-slate-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteOrder(orderToDelete.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <Trash2 size={14} />
              Delete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
