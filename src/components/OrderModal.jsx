import React, { useState, useEffect } from 'react';
import { useERPStore } from '../store/erpStore';
import { X, Save, Edit, Package, Calendar, Building2, Hash, Layers, Truck } from 'lucide-react';

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  poNo: '',
  poType: 'Purchase',
  partyName: '',
  partNo: '',
  productName: '',
  domains: 'No flag',
  orderQty: '',
  dispatchQty: '',
  manualStatus: 'Pending',
  deliveryDate: '',
  daysLeft: '',
  priority: 'Normal',
  remark: '',
  finalStatus: 'Pending Dispatch',
};

const PRIORITIES = ['Urgent', 'High', 'Medium', 'Normal', 'Low'];
const PO_TYPES = ['Purchase', 'Production'];
const MANUAL_STATUSES = ['Pending', 'In Progress', 'Completed'];
const FINAL_STATUSES = ['Pending Dispatch', 'Partial Dispatch', 'Dispatched'];

function Field({ label, children, required, icon: Icon }) {
  return (
    <div className="flex flex-col gap-2 relative">
      <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        {Icon && <Icon size={12} className="text-indigo-400" />}
        {label}
        {required && <span className="text-red-500 text-lg leading-none">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full pl-4 pr-10 py-3 text-[13px] font-medium rounded-xl text-slate-800 border border-slate-200 input-glow transition-all outline-none bg-white focus:bg-white focus:border-emerald-500/50 placeholder-slate-400";
const inputStyle = {};

export default function OrderModal() {
  const { isModalOpen, modalMode, selectedOrder, closeModal, addOrder, updateOrder } = useERPStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isModalOpen) {
      if (selectedOrder && (modalMode === 'edit' || modalMode === 'view')) {
        setForm({ ...EMPTY_FORM, ...selectedOrder });
      } else {
        setForm({ ...EMPTY_FORM });
      }
      setErrors({});
    }
  }, [isModalOpen, modalMode, selectedOrder]);

  if (!isModalOpen) return null;

  const isView = modalMode === 'view';
  const isEdit = modalMode === 'edit';
  const isAdd = modalMode === 'add';

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.poNo.trim()) e.poNo = 'PO Number is required';
    if (!form.partyName.trim()) e.partyName = 'Party name is required';
    if (!form.productName.trim()) e.productName = 'Product name is required';
    if (!form.orderQty || isNaN(form.orderQty)) e.orderQty = 'Valid quantity required';
    if (!form.deliveryDate) e.deliveryDate = 'Delivery date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isAdd) addOrder(form);
    else updateOrder(selectedOrder.id, form);
  };

  const TITLE = {
    view: 'View Order Details',
    edit: 'Edit Purchase Order',
    add:  'Create New Order',
  };

  const ICON_COLOR = { view: '#6366f1', edit: '#f59e0b', add: '#10b981' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={e => e.target === e.currentTarget && closeModal()}
    >
      <div
        className="modal-content w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[24px] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-slate-200"
        style={{
          background: '#ffffff',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${ICON_COLOR[modalMode]}30, ${ICON_COLOR[modalMode]}10)`, border: `1px solid ${ICON_COLOR[modalMode]}50` }}
            >
              {isView && <Package size={24} style={{ color: ICON_COLOR.view }} />}
              {isEdit && <Edit size={24} style={{ color: ICON_COLOR.edit }} />}
              {isAdd && <Package size={24} style={{ color: ICON_COLOR.add }} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{TITLE[modalMode]}</h2>
              {selectedOrder && <p className="text-sm font-medium text-slate-500 mt-0.5">{selectedOrder.poNo}</p>}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 hover:shadow-sm transition-all bg-white border border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form id="order-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">

            {/* Date */}
            <Field label="Date" icon={Calendar}>
              <input type="date" value={form.date} disabled={isView}
                onChange={e => set('date', e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>

            {/* PO No */}
            <Field label="PO Number" required icon={Hash}>
              <input type="text" value={form.poNo} disabled={isView}
                onChange={e => set('poNo', e.target.value)}
                placeholder="PO2024-XXXX"
                className={`${inputCls} ${errors.poNo ? 'border-red-500/50' : ''}`} style={inputStyle} />
              {errors.poNo && <p className="text-xs text-red-400">{errors.poNo}</p>}
            </Field>

            {/* PO Type */}
            <Field label="PO Type" icon={Layers}>
              <select value={form.poType} disabled={isView}
                onChange={e => set('poType', e.target.value)}
                className={inputCls} style={inputStyle}>
                {PO_TYPES.map(t => <option key={t} value={t} style={{background:'#1e2130'}}>{t}</option>)}
              </select>
            </Field>

            {/* Party Name */}
            <Field label="Party Name" required icon={Building2}>
              <input type="text" value={form.partyName} disabled={isView}
                onChange={e => set('partyName', e.target.value)}
                placeholder="Company / Party name"
                className={`${inputCls} ${errors.partyName ? 'border-red-500/50' : ''}`} style={inputStyle} />
              {errors.partyName && <p className="text-xs text-red-400">{errors.partyName}</p>}
            </Field>

            {/* Part No */}
            <Field label="Part Number">
              <input type="text" value={form.partNo} disabled={isView}
                onChange={e => set('partNo', e.target.value)}
                placeholder="PART-XXXX"
                className={inputCls} style={inputStyle} />
            </Field>

            {/* Priority */}
            <Field label="Priority">
              <select value={form.priority} disabled={isView}
                onChange={e => set('priority', e.target.value)}
                className={inputCls} style={inputStyle}>
                {PRIORITIES.map(p => <option key={p} value={p} style={{background:'#1e2130'}}>{p}</option>)}
              </select>
            </Field>

            {/* Product Name – full width */}
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Product Name" required icon={Package}>
                <input type="text" value={form.productName} disabled={isView}
                  onChange={e => set('productName', e.target.value)}
                  placeholder="Full product description"
                  className={`${inputCls} ${errors.productName ? 'border-red-500/50' : ''}`} style={inputStyle} />
                {errors.productName && <p className="text-xs text-red-400">{errors.productName}</p>}
              </Field>
            </div>

            {/* Order Qty */}
            <Field label="Order Quantity" required>
              <input type="number" min="0" value={form.orderQty} disabled={isView}
                onChange={e => set('orderQty', e.target.value)}
                placeholder="0"
                className={`${inputCls} ${errors.orderQty ? 'border-red-500/50' : ''}`} style={inputStyle} />
              {errors.orderQty && <p className="text-xs text-red-400">{errors.orderQty}</p>}
            </Field>

            {/* Dispatch Qty */}
            <Field label="Dispatch Quantity" icon={Truck}>
              <input type="number" min="0" value={form.dispatchQty} disabled={isView}
                onChange={e => set('dispatchQty', e.target.value)}
                placeholder="0"
                className={inputCls} style={inputStyle} />
            </Field>

            {/* Balance (read-only) */}
            <Field label="Balance Qty">
              <div
                className="w-full px-4 py-3 text-[13px] font-bold rounded-xl border border-slate-200 font-mono shadow-sm bg-slate-50"
                style={{ color: (Number(form.orderQty || 0) - Number(form.dispatchQty || 0)) > 0 ? '#ef4444' : '#10b981' }}
              >
                {Math.max(0, Number(form.orderQty || 0) - Number(form.dispatchQty || 0))}
              </div>
            </Field>

            {/* Delivery Date */}
            <Field label="Delivery Date" required icon={Calendar}>
              <input type="date" value={form.deliveryDate} disabled={isView}
                onChange={e => set('deliveryDate', e.target.value)}
                className={`${inputCls} ${errors.deliveryDate ? 'border-red-500/50' : ''}`} style={inputStyle} />
              {errors.deliveryDate && <p className="text-xs text-red-400">{errors.deliveryDate}</p>}
            </Field>

            {/* Days Left */}
            <Field label="Days Left">
              <input type="number" min="0" value={form.daysLeft} disabled={isView}
                onChange={e => set('daysLeft', e.target.value)}
                placeholder="0"
                className={inputCls} style={inputStyle} />
            </Field>

            {/* Manual Status */}
            <Field label="Manual Status">
              <select value={form.manualStatus} disabled={isView}
                onChange={e => set('manualStatus', e.target.value)}
                className={inputCls} style={inputStyle}>
                {MANUAL_STATUSES.map(s => <option key={s} value={s} style={{background:'#1e2130'}}>{s}</option>)}
              </select>
            </Field>

            {/* Final Status */}
            <Field label="Final Status">
              <select value={form.finalStatus} disabled={isView}
                onChange={e => set('finalStatus', e.target.value)}
                className={inputCls} style={inputStyle}>
                {FINAL_STATUSES.map(s => <option key={s} value={s} style={{background:'#1e2130'}}>{s}</option>)}
              </select>
            </Field>

            {/* Domains */}
            <Field label="Domains">
              <input type="text" value={form.domains} disabled={isView}
                onChange={e => set('domains', e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>

            {/* Remark – full width */}
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Remark">
                <textarea value={form.remark} disabled={isView}
                  onChange={e => set('remark', e.target.value)}
                  rows={2}
                  placeholder="Additional notes..."
                  className={`${inputCls} resize-none`} style={inputStyle} />
              </Field>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={closeModal}
            className="px-6 py-3 text-sm font-bold rounded-xl text-slate-600 bg-white border border-slate-200 hover:text-slate-800 hover:bg-slate-100 transition-all focus:ring-2 focus:ring-slate-200 outline-none"
          >
            {isView ? 'Close' : 'Cancel'}
          </button>

          {isView && (
            <button
              onClick={() => useERPStore.getState().openModal('edit', selectedOrder)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/50 outline-none"
            >
              <Edit size={16} /> Edit Order
            </button>
          )}
          {(isAdd || isEdit) && (
            <button
              type="submit"
              form="order-form"
              className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-xl text-white shadow-lg shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-500/50 outline-none"
            >
              <Save size={16} />
              {isAdd ? 'Create Order' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
