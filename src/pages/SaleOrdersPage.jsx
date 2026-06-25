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
  soNo: '',
  partyName: '',
  partyAddress: '',
  shippingAddress: '',
  items: [{
    partNo: '',
    productName: '',
    hsnCode: '',
    orderQty: '',
    uom: '',
    price: '',
    scheduleQty: '',
    deliveryDate: ''
  }],
  paymentTerms: '',
  deliveryTerms: '',
  remark: '',
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
  { key: 'soNo', label: 'PO No', width: '140px' },
  { key: 'partyName', label: 'Party Name', width: '180px' },
  { key: 'items_partNo', label: 'Part No', width: '150px' },
  { key: 'items_productName', label: 'Product Name', width: '240px' },
  { key: 'items_orderQty', label: 'Total Order Qty', width: '120px', align: 'right' },
  { key: 'items_scheduleQty', label: 'Total Sched Qty', width: '120px', align: 'right' },
  { key: 'items_deliveryDate', label: 'Schedule Date(s)', width: '140px' },
  { key: 'remark', label: 'Remarks', width: '140px' },
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

function SaleOrderForm({ mode, order, onBack }) {
  const {
    addOrder, updateOrder, saleOrderLookups,
    addSaleOrderLookupOption, renameSaleOrderLookupOption, deleteSaleOrderLookupOption,
    partyMasterItems
  } = useERPStore();
  const [form, setForm] = useState(() => {
    if (order) {
      let items = order.items || [];
      if (items.length === 0) {
        // Migrate legacy flat structure
        const legacyPartNos = Array.isArray(order.partNos) ? order.partNos : (order.partNo ? [order.partNo] : ['']);
        items = legacyPartNos.map((p, i) => ({
          partNo: p,
          productName: i === 0 ? (order.productName || '') : '',
          hsnCode: '',
          orderQty: i === 0 ? (order.orderQty || '') : '',
          uom: '',
          price: '',
          scheduleQty: '',
          deliveryDate: i === 0 ? (order.deliveryDate || '') : ''
        }));
      }
      let partyAddress = order.partyAddress || '';
      if (!partyAddress && order.partyName) {
        const party = partyMasterItems?.find(p => p.partyName === order.partyName);
        if (party) partyAddress = party.address || '';
      }
      return { ...EMPTY_ORDER, ...order, items, partyAddress };
    }
    return { ...EMPTY_ORDER };
  });
  const [errors, setErrors] = useState({});

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const customerParties = (partyMasterItems || []).filter(p => p.partyCategory === 'Customer');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.soNo?.trim()) e.soNo = 'PO Number is required';
    if (!form.partyName?.trim()) e.partyName = 'Party name is required';

    (form.items || []).forEach((item, idx) => {
      if (!item.orderQty || isNaN(item.orderQty)) e[`item_${idx}_orderQty`] = 'Valid quantity required';
      if (!item.deliveryDate) e[`item_${idx}_deliveryDate`] = 'Schedule date required';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const finalForm = { ...form };

    finalForm.items = (finalForm.items || []).filter(item =>
      item.partNo || item.productName || item.hsnCode || item.uom || item.price || item.orderQty || item.deliveryDate || item.scheduleQty
    );
    if (finalForm.items.length === 0) {
      finalForm.items = [{ ...EMPTY_ORDER.items[0] }];
    }

    delete finalForm.partNos;
    delete finalForm.partNo;
    delete finalForm.productName;
    delete finalForm.orderQty;
    delete finalForm.deliveryDate;

    if (isAdd) addOrder(finalForm);
    else updateOrder(order.id, finalForm);
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
                {isView ? 'View Sale Order' : isAdd ? 'Create Sale Order' : 'Edit Sale Order'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {form.soNo || 'Fill the details below'}
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
                    aria-label="Created Date"
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
                      <HeroCalendar aria-label="Created Date Calendar">
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

                <Field label="Purchase Date">
                  <DatePicker
                    value={form.date ? parseDate(form.date) : null}
                    isDisabled={!isAdd}
                    onChange={(dateVal) => set('date', dateVal ? dateVal.toString() : '')}
                    className="w-full"
                    aria-label="Purchase Date"
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
                      <HeroCalendar aria-label="Purchase Date Calendar">
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

                <Field label="PO Number" required error={errors.soNo}>
                  <Input type="text" value={form.soNo} disabled={isView} onChange={e => set('soNo', e.target.value)} placeholder="SO2024-XXXX" className={`${inputCls} px-4 py-3`} aria-label="PO Number" />
                </Field>



                <Field label="Party Name" required error={errors.partyName}>
                  <Select
                    selectedKeys={form.partyName ? [form.partyName] : []}
                    onSelectionChange={v => {
                      const partyName = Array.from(v)[0];
                      const party = customerParties.find(p => p.partyName === partyName);
                      setForm(f => ({ ...f, partyName, partyAddress: party?.address || '' }));
                    }}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Party Name"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder="Select Customer Party" />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {customerParties.map(p => (
                          <ListBox.Item key={p.partyName} id={p.partyName} textValue={p.partyName}>
                            <div className="flex flex-col gap-0.5 py-0.5">
                              <span className="font-bold text-slate-800">{p.partyName}</span>
                            </div>
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>

                {form.partyAddress && (
                  <Field label="Party Address" wide>
                    <textarea
                      value={form.partyAddress}
                      disabled={true}
                      className={`${inputCls} min-h-[60px] resize-y px-4 py-3 bg-slate-50 text-slate-600`}
                      readOnly
                    />
                  </Field>
                )}

                <Field label="Shipping Address" wide>
                  <textarea
                    value={form.shippingAddress || ''}
                    disabled={isView}
                    onChange={e => set('shippingAddress', e.target.value)}
                    className={`${inputCls} min-h-[60px] resize-y px-4 py-3`}
                    placeholder="Enter shipping address..."
                  />
                </Field>

                <Field label="Payment Terms">
                  <EditableCreatableSelect
                    value={form.paymentTerms}
                    options={saleOrderLookups.paymentTerms || []}
                    disabled={isView}
                    placeholder="Select or enter payment terms"
                    onChange={v => set('paymentTerms', v)}
                    onAdd={(newOption) => addSaleOrderLookupOption('paymentTerms', newOption)}
                    onRename={(oldOption, newOption) => renameSaleOrderLookupOption('paymentTerms', oldOption, newOption)}
                    onDelete={(option) => deleteSaleOrderLookupOption('paymentTerms', option)}
                  />
                </Field>

                <Field label="Delivery Terms">
                  <EditableCreatableSelect
                    value={form.deliveryTerms}
                    options={saleOrderLookups.deliveryTerms || []}
                    disabled={isView}
                    placeholder="Select or enter delivery terms"
                    onChange={v => set('deliveryTerms', v)}
                    onAdd={(newOption) => addSaleOrderLookupOption('deliveryTerms', newOption)}
                    onRename={(oldOption, newOption) => renameSaleOrderLookupOption('deliveryTerms', oldOption, newOption)}
                    onDelete={(option) => deleteSaleOrderLookupOption('deliveryTerms', option)}
                  />
                </Field>

                <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col gap-4 mt-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Package size={16} className="text-emerald-500" />
                    Item Details
                  </h3>

                  {(() => {
                    const item = form.items?.[0] || {};
                    const index = 0;
                    return (
                      <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                          <Field label="Part Number">
                            <Input
                              type="text"
                              value={item.partNo || ''}
                              disabled={isView}
                              placeholder="Part Number"
                              onChange={e => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), partNo: e.target.value };
                                set('items', newItems);
                              }}
                              className={`${inputCls} px-4 py-3`}
                              aria-label="Part Number"
                            />
                          </Field>

                          <Field label="Product Name" wide>
                            <Input
                              type="text"
                              value={item.productName || ''}
                              disabled={isView}
                              placeholder="Product Name"
                              onChange={e => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), productName: e.target.value };
                                set('items', newItems);
                              }}
                              className={`${inputCls} px-4 py-3`}
                              aria-label="Product Name"
                            />
                          </Field>

                          <Field label="HSN Code">
                            <Input
                              type="text"
                              value={item.hsnCode || ''}
                              disabled={isView}
                              placeholder="HSN Code"
                              onChange={e => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), hsnCode: e.target.value };
                                set('items', newItems);
                              }}
                              className={`${inputCls} px-4 py-3`}
                              aria-label="HSN Code"
                            />
                          </Field>
                          
                          <Field label="Order Qty" required error={errors[`item_${index}_orderQty`]}>
                            <Input
                              type="number"
                              value={item.orderQty || ''}
                              disabled={isView}
                              placeholder="0"
                              onChange={e => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), orderQty: e.target.value };
                                set('items', newItems);
                              }}
                              className={`${inputCls} px-4 py-3`}
                              aria-label="Order Qty"
                            />
                          </Field>

                          <Field label="UOM">
                            <EditableCreatableSelect
                              value={item.uom || ''}
                              options={saleOrderLookups.uom || []}
                              disabled={isView}
                              placeholder="Select UOM"
                              onChange={v => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), uom: v };
                                set('items', newItems);
                              }}
                              onAdd={(newOption) => addSaleOrderLookupOption('uom', newOption)}
                              onRename={(oldOption, newOption) => renameSaleOrderLookupOption('uom', oldOption, newOption)}
                              onDelete={(option) => deleteSaleOrderLookupOption('uom', option)}
                            />
                          </Field>

                          <Field label="Price">
                            <Input
                              type="number"
                              value={item.price || ''}
                              disabled={isView}
                              placeholder="0.00"
                              onChange={e => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), price: e.target.value };
                                set('items', newItems);
                              }}
                              className={`${inputCls} px-4 py-3`}
                              aria-label="Price"
                            />
                          </Field>

                          <Field label="Schedule Qty">
                            <Input
                              type="number"
                              value={item.scheduleQty || ''}
                              disabled={isView}
                              placeholder="0"
                              onChange={e => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), scheduleQty: e.target.value };
                                set('items', newItems);
                              }}
                              className={`${inputCls} px-4 py-3`}
                              aria-label="Schedule Qty"
                            />
                          </Field>

                          <Field label="Schedule Date" required error={errors[`item_${index}_deliveryDate`]}>
                            <DatePicker
                              value={item.deliveryDate ? parseDate(item.deliveryDate) : null}
                              isDisabled={isView}
                              onChange={(dateVal) => {
                                const newItems = [...(form.items || [])];
                                newItems[0] = { ...(newItems[0] || {}), deliveryDate: dateVal ? dateVal.toString() : '' };
                                set('items', newItems);
                              }}
                              className="w-full"
                              aria-label="Schedule Date"
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
                                <HeroCalendar aria-label="Schedule Date Calendar">
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
                        </div>
                      </div>
                    );
                  })()}
                </div>


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

export default function SaleOrdersPage() {
  const {
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    sortField, sortDirection, setSortField, setSortDirection,
    getFilteredOrders, deleteOrder, getStats, orders, saleOrderLookups
  } = useERPStore();

  const [viewState, setViewState] = useState({ type: 'table', mode: null, order: null });
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);


  const allStatuses = ['All', ...(saleOrderLookups?.finalStatus || [])];
  const allPriorities = ['All', ...(saleOrderLookups?.priority || [])];

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
  };

  const exportCsv = () => {
    const headers = COLUMNS.map(field => field.label);
    const rows = filtered.map(order => COLUMNS.map(field => String(order[field.key] ?? '').replaceAll('"', '""')));
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sale-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (order, column) => {
    const value = order[column.key];

    if (column.key === 'soNo') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }



    if (column.key === 'partyName') {
      return <span className="font-bold text-slate-800 line-clamp-2" title={value}>{value || '-'}</span>;
    }

    if (column.key?.startsWith('items_')) {
      const items = order.items || [];
      if (column.key === 'items_partNo') {
        const val = items.map(i => i.partNo).filter(Boolean).join(', ');
        return <span className="font-semibold text-slate-700 whitespace-nowrap" title={val}>{val || '-'}</span>;
      }
      if (column.key === 'items_productName') {
        const val = items.map(i => i.productName).filter(Boolean).join(', ');
        return <span className="font-bold text-slate-800 line-clamp-2" title={val}>{val || '-'}</span>;
      }
      if (column.key === 'items_orderQty') {
        const sum = items.reduce((s, i) => s + Number(i.orderQty || 0), 0);
        return <span className="text-slate-700 font-bold">{sum.toLocaleString()}</span>;
      }
      if (column.key === 'items_scheduleQty') {
        const sum = items.reduce((s, i) => s + Number(i.scheduleQty || 0), 0);
        return <span className="text-slate-700 font-bold">{sum.toLocaleString()}</span>;
      }
      if (column.key === 'items_deliveryDate') {
        const val = [...new Set(items.map(i => i.deliveryDate).filter(Boolean))].join(', ');
        return <span className="font-semibold text-slate-700 whitespace-nowrap" title={val}>{val || '-'}</span>;
      }
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

    if (column.key === 'dispatchQty') return <span className="text-emerald-600 font-bold">{Number(value).toLocaleString()}</span>;
    if (column.key === 'balanceQty') return <span className="font-bold" style={{ color: Number(value) > 0 ? '#ef4444' : '#10b981' }}>{Number(value).toLocaleString()}</span>;

    if (column.key === 'daysLeft') {
      return (
        <span className={`font-bold px-2 py-1 rounded-md ${Number(value) <= 3 ? 'bg-red-50 text-red-600 border border-red-200' : Number(value) <= 10 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-500'}`}>
          {Number(value) === 0 ? '—' : value}
        </span>
      );
    }

    if (column.key === 'date') {
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
        <SaleOrderForm
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
                  placeholder="Search by SO No, Party, Product, Part No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search orders"
                  className="w-full pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-emerald-500/50 bg-white border border-slate-200"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
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
              {(searchQuery || filterStatus !== 'All' || filterPriority !== 'All') && (
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
