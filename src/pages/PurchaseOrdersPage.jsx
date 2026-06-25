import { useState } from 'react';
import {
  ArrowLeft, BadgeCheck,
  Edit, Eye, FileDown, Hash, Plus, RefreshCw, Save, Search, SlidersHorizontal,
  Tag, Trash2, X, ChevronUp, ChevronDown, ChevronsUpDown, Package, Activity, Truck
} from 'lucide-react';
import { Table, Input, Select, ListBox, DatePicker, DateField, Calendar as HeroCalendar } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import StatsCard from '../components/common/StatsCard';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import { useERPStore } from '../store/erpStore';

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_ORDER = {
  createdDate: todayIsoDate(),
  date: todayIsoDate(),
  poNo: '',
  poType: 'Purchase',
  processLocation: '',
  partyName: '',
  partNo: '',
  productName: '',
  typeOfProcess: '',
  orderQty: '',
  dispatchQty: '',
  deliveryDate: '',
  daysLeft: '',
  priority: 'Normal',
  remark: '',
  finalStatus: 'Pending Dispatch',
};

const PRIORITY_STYLES = {
  Urgent: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', dot: '#ef4444' },
  High: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', dot: '#f97316' },
  Medium: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', dot: '#f59e0b' },
  Normal: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', dot: '#10b981' },
  Low: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#64748b' },
};

const STATUS_STYLES = {
  'Dispatched': { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'Partial Dispatch': { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  'Pending Dispatch': { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  'In Progress': { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
};

function SortIcon({ sortDirection }) {
  if (!sortDirection) return <ChevronsUpDown size={12} className="text-slate-600" />;
  return sortDirection === 'ascending'
    ? <ChevronUp size={12} className="text-indigo-400" />
    : <ChevronDown size={12} className="text-indigo-400" />;
}

const COLUMNS = [
  { key: 'date', label: 'Date', width: '100px' },
  { key: 'poNo', label: 'PO No', width: '140px' },
  { key: 'poType', label: 'PO Type', width: '110px' },
  { key: 'processLocation', label: 'Process Location', width: '160px' },
  { key: 'partyName', label: 'Party Name', width: '180px' },
  { key: 'partNo', label: 'Part No', width: '130px' },
  { key: 'productName', label: 'Product Name', width: '240px' },
  { key: 'typeOfProcess', label: 'Type of Process', width: '160px' },
  { key: 'orderQty', label: 'Order Qty', width: '100px', align: 'right' },
  { key: 'dispatchQty', label: 'Dispatch Qty', width: '110px', align: 'right' },
  { key: 'balanceQty', label: 'Balance Qty', width: '110px', align: 'right' },
  { key: 'deliveryDate', label: 'Delivery Date', width: '120px' },
  { key: 'daysLeft', label: 'Days Left', width: '90px', align: 'center' },
  { key: 'priority', label: 'Priority', width: '100px' },
  { key: 'remark', label: 'Remarks', width: '140px' },
  { key: 'finalStatus', label: 'Final Status', width: '140px' },
];

// --- Form Component ---
function Field({ label, children, required, error, wide }) {
  return (
    <label className={`flex flex-col gap-2 relative ${wide ? 'md:col-span-2 xl:col-span-3' : ''}`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}

function PurchaseOrderForm({ mode, order, onBack }) {
  const { 
    addOrder, updateOrder, purchaseOrderLookups,
    addPurchaseOrderLookupOption, renamePurchaseOrderLookupOption, deletePurchaseOrderLookupOption
  } = useERPStore();
  const [form, setForm] = useState(() => order ? { ...EMPTY_ORDER, ...order } : { ...EMPTY_ORDER });
  const [errors, setErrors] = useState({});

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.poNo?.trim()) e.poNo = 'PO Number is required';
    if (!form.partyName?.trim()) e.partyName = 'Party name is required';
    if (!form.productName?.trim()) e.productName = 'Product name is required';
    if (!form.orderQty || isNaN(form.orderQty)) e.orderQty = 'Valid quantity required';
    if (!form.deliveryDate) e.deliveryDate = 'Delivery date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isAdd) addOrder(form);
    else updateOrder(order.id, form);
    onBack();
  };

  const inputCls = "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

  return (
    <div className="animate-slide-up">
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 flex items-center justify-center transition-all"
              title="Back to table"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-200 shadow-lg shadow-emerald-500/10">
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Package size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Purchase Order' : isAdd ? 'Create Purchase Order' : 'Edit Purchase Order'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {form.poNo || 'Fill the details below'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <X size={16} />
              Back
            </button>
            {!isView && (
              <button
                type="submit"
                form="po-form"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Order' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="po-form" onSubmit={submit} className="p-6">
          <div className="flex flex-col gap-7">
            <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Tag size={15} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Order Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                <Field label="Created Date">
                  <DatePicker
                    value={form.createdDate ? parseDate(form.createdDate) : (form.date ? parseDate(form.date) : null)}
                    isDisabled={true}
                    onChange={(dateVal) => set('createdDate', dateVal ? dateVal.toString() : '')}
                    className="w-full"
                  >
                    <DateField.Group className={`${inputCls} flex items-center overflow-hidden h-[46px] !pr-2 !py-0`} fullWidth>
                      <DateField.Input className="flex-1 px-4 py-3 outline-none bg-transparent opacity-70">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix className="pr-2 opacity-50">
                        <DatePicker.Trigger className="text-slate-500 cursor-not-allowed">
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover>
                      <HeroCalendar>
                        <HeroCalendar.Header>
                          <HeroCalendar.NavButton slot="previous" />
                          <HeroCalendar.NavButton slot="next" />
                        </HeroCalendar.Header>
                        <HeroCalendar.Grid>
                          <HeroCalendar.GridHeader>
                            {(day) => <HeroCalendar.HeaderCell>{day}</HeroCalendar.HeaderCell>}
                          </HeroCalendar.GridHeader>
                          <HeroCalendar.GridBody>{(date) => <HeroCalendar.Cell date={date} />}</HeroCalendar.GridBody>
                        </HeroCalendar.Grid>
                      </HeroCalendar>
                    </DatePicker.Popover>
                  </DatePicker>
                </Field>

                <Field label="Purchase Order Actual Date">
                  <DatePicker
                    value={form.date ? parseDate(form.date) : null}
                    isDisabled={!isAdd}
                    onChange={(dateVal) => set('date', dateVal ? dateVal.toString() : '')}
                    className="w-full"
                  >
                    <DateField.Group className={`${inputCls} flex items-center overflow-hidden h-[46px] !pr-2 !py-0`} fullWidth>
                      <DateField.Input className="flex-1 px-4 py-3 outline-none bg-transparent">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix className="pr-2">
                        <DatePicker.Trigger className="text-slate-500 hover:text-emerald-600 transition-colors">
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover>
                      <HeroCalendar>
                        <HeroCalendar.Header>
                          <HeroCalendar.NavButton slot="previous" />
                          <HeroCalendar.NavButton slot="next" />
                        </HeroCalendar.Header>
                        <HeroCalendar.Grid>
                          <HeroCalendar.GridHeader>
                            {(day) => <HeroCalendar.HeaderCell>{day}</HeroCalendar.HeaderCell>}
                          </HeroCalendar.GridHeader>
                          <HeroCalendar.GridBody>{(date) => <HeroCalendar.Cell date={date} />}</HeroCalendar.GridBody>
                        </HeroCalendar.Grid>
                      </HeroCalendar>
                    </DatePicker.Popover>
                  </DatePicker>
                </Field>

                <Field label="PO Number" required error={errors.poNo}>
                  <Input type="text" value={form.poNo} isDisabled={isView} onChange={e => set('poNo', e.target.value)} placeholder="PO2024-XXXX" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="PO Type">
                  <EditableCreatableSelect
                    value={form.poType}
                    options={purchaseOrderLookups.poType || []}
                    disabled={isView}
                    placeholder="PO Type"
                    onChange={v => set('poType', v)}
                    onAdd={(newOption) => addPurchaseOrderLookupOption('poType', newOption)}
                    onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('poType', oldOption, newOption)}
                    onDelete={(option) => deletePurchaseOrderLookupOption('poType', option)}
                  />
                </Field>

                <Field label="Process Location">
                  <Input type="text" value={form.processLocation} isDisabled={isView} onChange={e => set('processLocation', e.target.value)} placeholder="E.g. Vendor / Production" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Party Name" required error={errors.partyName}>
                  <Input type="text" value={form.partyName} isDisabled={isView} onChange={e => set('partyName', e.target.value)} placeholder="Company / Party name" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Part Number">
                  <Input type="text" value={form.partNo} isDisabled={isView} onChange={e => set('partNo', e.target.value)} placeholder="PART-XXXX" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Product Name" required wide error={errors.productName}>
                  <Input type="text" value={form.productName} isDisabled={isView} onChange={e => set('productName', e.target.value)} placeholder="Full product description" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Type of Process">
                  <Input type="text" value={form.typeOfProcess} isDisabled={isView} onChange={e => set('typeOfProcess', e.target.value)} placeholder="E.g. Moulding" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Order Quantity" required error={errors.orderQty}>
                  <Input type="number" value={form.orderQty} isDisabled={isView} onChange={e => set('orderQty', e.target.value)} placeholder="0" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Dispatch Quantity">
                  <Input type="number" value={form.dispatchQty} isDisabled={isView} onChange={e => set('dispatchQty', e.target.value)} placeholder="0" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Balance Qty">
                  <div className="w-full px-4 py-3 text-[13px] font-bold rounded-xl border border-slate-200 font-mono shadow-sm bg-slate-50 flex items-center h-[46px]" style={{ color: (Number(form.orderQty || 0) - Number(form.dispatchQty || 0)) > 0 ? '#ef4444' : '#10b981' }}>
                    {Math.max(0, Number(form.orderQty || 0) - Number(form.dispatchQty || 0))}
                  </div>
                </Field>

                <Field label="Delivery Date" required error={errors.deliveryDate}>
                  <DatePicker
                    value={form.deliveryDate ? parseDate(form.deliveryDate) : null}
                    isDisabled={isView}
                    onChange={(dateVal) => set('deliveryDate', dateVal ? dateVal.toString() : '')}
                    className="w-full"
                  >
                    <DateField.Group className={`${inputCls} flex items-center overflow-hidden h-[46px] !pr-2 !py-0`} fullWidth>
                      <DateField.Input className="flex-1 px-4 py-3 outline-none bg-transparent">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix className="pr-2">
                        <DatePicker.Trigger className="text-slate-500 hover:text-emerald-600 transition-colors">
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover>
                      <HeroCalendar>
                        <HeroCalendar.Header>
                          <HeroCalendar.NavButton slot="previous" />
                          <HeroCalendar.NavButton slot="next" />
                        </HeroCalendar.Header>
                        <HeroCalendar.Grid>
                          <HeroCalendar.GridHeader>
                            {(day) => <HeroCalendar.HeaderCell>{day}</HeroCalendar.HeaderCell>}
                          </HeroCalendar.GridHeader>
                          <HeroCalendar.GridBody>{(date) => <HeroCalendar.Cell date={date} />}</HeroCalendar.GridBody>
                        </HeroCalendar.Grid>
                      </HeroCalendar>
                    </DatePicker.Popover>
                  </DatePicker>
                </Field>

                <Field label="Days Left">
                  <Input type="number" value={form.daysLeft} isDisabled={isView} onChange={e => set('daysLeft', e.target.value)} placeholder="0" className={`${inputCls} px-4 py-3`} />
                </Field>

                <Field label="Priority">
                  <EditableCreatableSelect
                    value={form.priority}
                    options={purchaseOrderLookups.priority || []}
                    disabled={isView}
                    placeholder="Priority"
                    onChange={v => set('priority', v)}
                    onAdd={(newOption) => addPurchaseOrderLookupOption('priority', newOption)}
                    onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('priority', oldOption, newOption)}
                    onDelete={(option) => deletePurchaseOrderLookupOption('priority', option)}
                  />
                </Field>

                <Field label="Final Status">
                  <EditableCreatableSelect
                    value={form.finalStatus}
                    options={purchaseOrderLookups.finalStatus || []}
                    disabled={isView}
                    placeholder="Final Status"
                    onChange={v => set('finalStatus', v)}
                    onAdd={(newOption) => addPurchaseOrderLookupOption('finalStatus', newOption)}
                    onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('finalStatus', oldOption, newOption)}
                    onDelete={(option) => deletePurchaseOrderLookupOption('finalStatus', option)}
                  />
                </Field>

                <Field label="Remarks" wide>
                  <textarea
                    value={form.remark || ''}
                    disabled={isView}
                    onChange={e => set('remark', e.target.value)}
                    className={`${inputCls} min-h-28 resize-y px-4 py-3`}
                    placeholder="Additional notes..."
                  />
                </Field>

              </div>
            </section>
          </div>

          {!isView && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Order' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function PurchaseOrdersPage() {
  const {
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterPoType, setFilterPoType,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    sortField, sortDirection, setSortField, setSortDirection,
    getFilteredOrders, deleteOrder, getStats, orders, purchaseOrderLookups
  } = useERPStore();

  const [viewState, setViewState] = useState({ type: 'table', mode: null, order: null });
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);

  const allPoTypes = ['All', ...(purchaseOrderLookups?.poType || [])];
  const allStatuses = ['All', ...(purchaseOrderLookups?.finalStatus || [])];
  const allPriorities = ['All', ...(purchaseOrderLookups?.priority || [])];

  const filtered = getFilteredOrders();
  const stats = getStats();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openForm = (mode, order = null) => {
    setDeleteCandidateId(null);
    setViewState({ type: 'form', mode, order });
  };

  const backToTable = () => setViewState({ type: 'table', mode: null, order: null });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterPriority('All');
    setFilterPoType('All');
  };

  const exportCsv = () => {
    const headers = COLUMNS.map(field => field.label);
    const rows = filtered.map(order => COLUMNS.map(field => String(order[field.key] ?? '').replaceAll('"', '""')));
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'purchase-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (order, column) => {
    const value = order[column.key];

    if (column.key === 'poNo') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }

    if (column.key === 'poType') {
      return (
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${value === 'Purchase' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
          {value || '-'}
        </span>
      );
    }

    if (column.key === 'partyName' || column.key === 'productName') {
      return <span className="font-bold text-slate-800 line-clamp-2" title={value}>{value || '-'}</span>;
    }

    if (column.key === 'priority') {
      const priStyle = PRIORITY_STYLES[value] || PRIORITY_STYLES.Normal;
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{ background: priStyle.bg, color: priStyle.text, border: `1px solid ${priStyle.bg.replace('0.15', '0.3')}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: priStyle.dot }} />
          {value || '-'}
        </span>
      );
    }

    if (column.key === 'finalStatus') {
      const statusStyle = STATUS_STYLES[value] || {};
      return (
        <span
          className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm"
          style={{
            background: statusStyle.bg || 'rgba(100,116,139,0.12)',
            color: statusStyle.text || '#64748b',
            border: `1px solid ${statusStyle.border || 'rgba(100,116,139,0.2)'}`,
          }}
        >
          {value || '-'}
        </span>
      );
    }

    if (column.key === 'orderQty') return <span className="text-slate-700 font-bold">{Number(value).toLocaleString()}</span>;
    if (column.key === 'dispatchQty') return <span className="text-emerald-600 font-bold">{Number(value).toLocaleString()}</span>;
    if (column.key === 'balanceQty') return <span className="font-bold" style={{ color: Number(value) > 0 ? '#ef4444' : '#10b981' }}>{Number(value).toLocaleString()}</span>;

    if (column.key === 'daysLeft') {
      return (
        <span className={`font-bold px-2 py-1 rounded-md ${Number(value) <= 3 ? 'bg-red-50 text-red-600 border border-red-200' : Number(value) <= 10 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-500'}`}>
          {Number(value) === 0 ? '—' : value}
        </span>
      );
    }

    if (column.key === 'date' || column.key === 'deliveryDate' || column.key === 'partNo') {
      return <span className="font-semibold text-slate-700 whitespace-nowrap">{value || '-'}</span>;
    }

    return <span className="block max-w-[240px] truncate" title={value}>{value || '-'}</span>;
  };

  return (
    <div className="p-3 max-w-[1920px] mx-auto animate-slide-up">
      {viewState.type !== 'form' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Total Orders" value={stats.total.toLocaleString()} icon={Package} color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.25)" animationDelay={0} />
          <StatsCard label="Pending Dispatch" value={stats.pending.toLocaleString()} icon={Activity} color="#f59e0b" bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.25)" animationDelay={50} />
          <StatsCard label="Partial Dispatch" value={stats.partial.toLocaleString()} icon={Truck} color="#6366f1" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.25)" animationDelay={100} />
          <StatsCard label="Dispatched" value={stats.dispatched.toLocaleString()} icon={BadgeCheck} color="#ef4444" bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.25)" animationDelay={150} />
        </div>
      )}

      {viewState.type === 'form' ? (
        <PurchaseOrderForm
          key={`${viewState.mode}-${viewState.order?.id || 'new'}`}
          mode={viewState.mode}
          order={viewState.order}
          onBack={backToTable}
        />
      ) : (
        <>
          <div className="glass-card rounded-2xl p-5 shadow-xl mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full min-w-0 group">
                <Input
                  type="text"
                  placeholder="Search by PO No, Party, Product, Part No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full"
                  classNames={{
                    inputWrapper: "pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-emerald-500/50 bg-white border border-slate-200"
                  }}
                  startContent={<Search size={18} className="text-slate-500 group-focus-within:text-emerald-500 transition-colors absolute left-4" />}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <Select
                  selectedKeys={[filterPoType]}
                  onSelectionChange={v => setFilterPoType(Array.from(v)[0])}
                  className="w-[150px]"
                  aria-label="PO Type Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {allPoTypes.map(t => <ListBox.Item key={t} id={t} textValue={t === 'All' ? 'All Types' : t}>{t === 'All' ? 'All Types' : t}</ListBox.Item>)}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select
                  selectedKeys={[filterStatus]}
                  onSelectionChange={v => setFilterStatus(Array.from(v)[0])}
                  className="w-[160px]"
                  aria-label="Status Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {allStatuses.map(s => <ListBox.Item key={s} id={s} textValue={s === 'All' ? 'All Status' : s}>{s === 'All' ? 'All Status' : s}</ListBox.Item>)}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select
                  selectedKeys={[filterPriority]}
                  onSelectionChange={v => setFilterPriority(Array.from(v)[0])}
                  className="w-[150px]"
                  aria-label="Priority Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {allPriorities.map(p => <ListBox.Item key={p} id={p} textValue={p === 'All' ? 'All Priority' : p}>{p === 'All' ? 'All Priority' : p}</ListBox.Item>)}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="flex gap-3 w-full xl:w-auto shrink-0">
                <button onClick={exportCsv} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all flex-1 xl:flex-none">
                  <FileDown size={18} />
                  Export
                </button>
                <button onClick={() => openForm('add')} className="btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 flex-1 xl:flex-none">
                  <Plus size={18} strokeWidth={2.5} />
                  Add Order
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{orders.length}</span> orders
              </p>
              {(searchQuery || filterStatus !== 'All' || filterPriority !== 'All' || filterPoType !== 'All') && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                  <RefreshCw size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl pb-4">
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label="Orders table"
                  className="text-left"
                  style={{ minWidth: '2200px' }}
                  sortDescriptor={{ column: sortField, direction: sortDirection === 'asc' ? 'ascending' : 'descending' }}
                  onSortChange={(descriptor) => {
                    setSortField(descriptor.column);
                    setSortDirection(descriptor.direction === 'ascending' ? 'asc' : 'desc');
                  }}
                >
                  <Table.Header>
                    <Table.Column isRowHeader className="w-28 whitespace-nowrap">
                      Actions
                    </Table.Column>
                    {COLUMNS.map((col) => (
                      <Table.Column
                        key={col.key}
                        id={col.key}
                        allowsSorting
                        className="whitespace-nowrap"
                        style={{ minWidth: col.width, textAlign: col.align || 'left' }}
                      >
                        {({ sortDirection }) => (
                          <span className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                            {col.label}
                            <SortIcon sortDirection={sortDirection} />
                          </span>
                        )}
                      </Table.Column>
                    ))}
                  </Table.Header>
                  <Table.Body items={pagedOrders} renderEmptyState={() => (
                    <div className="py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                          <SlidersHorizontal size={32} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">No orders found. Try adjusting your filters.</p>
                      </div>
                    </div>
                  )}>
                    {(order) => (
                      <Table.Row key={order.id} className="group">
                        <Table.Cell>
                          {deleteCandidateId === order.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  deleteOrder(order.id);
                                  setDeleteCandidateId(null);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteCandidateId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                              <button onClick={() => openForm('view', order)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all" title="View">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => openForm('edit', order)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all" title="Edit">
                                <Edit size={15} />
                              </button>
                              <button onClick={() => setDeleteCandidateId(order.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </Table.Cell>
                        {COLUMNS.map((col) => (
                          <Table.Cell key={col.key} className="text-[13px] text-slate-700" style={{ textAlign: col.align || 'left' }}>
                            {renderCellValue(order, col)}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <span>Rows per page:</span>
                <Select
                  selectedKeys={[itemsPerPage.toString()]}
                  onSelectionChange={(val) => setItemsPerPage(Number(Array.from(val)[0]))}
                  className="w-[80px]"
                  aria-label="Rows per page"
                >
                  <Select.Trigger className="px-3 py-1.5 h-auto min-h-[34px] rounded-lg text-slate-700 bg-white border border-slate-200 outline-none hover:bg-slate-50 transition-colors">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {[5, 10, 20, 50].map(count => (
                        <ListBox.Item key={count.toString()} id={count.toString()} textValue={count.toString()}>
                          {count}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: Math.min(5, totalPages || 1) }, (_, index) => {
                    let page;
                    if (totalPages <= 5) page = index + 1;
                    else if (currentPage <= 3) page = index + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + index;
                    else page = currentPage - 2 + index;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${currentPage === page
                          ? 'text-white bg-emerald-600 border border-emerald-500 shadow-lg shadow-emerald-500/30'
                          : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{currentPage}</span> of{' '}
                <span className="text-slate-800">{totalPages || 1}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
