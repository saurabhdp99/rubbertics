import { useState, useEffect } from 'react';
import {
  ArrowLeft, BadgeCheck,
  Edit, Eye, FileDown, Hash, Plus, RefreshCw, Save, Search, SlidersHorizontal,
  Tag, Trash2, X, ChevronUp, ChevronDown, ChevronsUpDown, ShoppingCart, Activity, CheckCircle, AlertCircle, Loader2, ClipboardList
} from 'lucide-react';
import { Table, Input, Select, ListBox, DatePicker, DateField, Calendar as HeroCalendar, Spinner } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StatsCard from '../components/common/StatsCard';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';
import { usePartyMasterStore } from '../store/partyMasterStore';
import { useAuthStore } from '../store/authStore';
import { useItemMasterStore } from '../store/itemMasterStore';
import { supabase } from '../lib/supabase';
import { formatTableDate } from '../utils/dateFormatter';

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_ORDER = {
  createdDate: todayIsoDate(),
  date: todayIsoDate(),
  poNo: '',
  npplPoNo: '',
  vendorName: '',
  vendorAddress: '',
  shippingAddress: '',
  items: [{
    partNo: '',
    productName: '',
    hsnCode: '',
    orderQty: '',
    uom: '',
    price: '',
    schedules: [{ scheduleQty: '', deliveryDate: '' }]
  }],
  paymentTerms: '',
  deliveryTerms: '',
  status: 'Pending',
  remark: '',
};

const STATUS_STYLES = {
  'Draft':     { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  'Pending':   { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  'Approved':  { bg: 'rgba(99,102,241,0.12)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  'Completed': { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'Cancelled': { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

function SortIcon({ sortDirection }) {
  if (!sortDirection) return <ChevronsUpDown size={12} className="text-slate-600" />;
  return sortDirection === 'ascending'
    ? <ChevronUp size={12} className="text-indigo-400" />
    : <ChevronDown size={12} className="text-indigo-400" />;
}

const COLUMNS = [
  { key: 'date',              label: 'Date',             width: '100px' },
  { key: 'poNo',              label: 'PO No',            width: '140px' },
  { key: 'npplPoNo',          label: 'NPPL Purchase Order No.',     width: '180px' },
  { key: 'vendorName',        label: 'Vendor Name',      width: '180px' },
  { key: 'items_partNo',      label: 'Part No',          width: '150px' },
  { key: 'items_productName', label: 'Product Name',     width: '240px' },
  { key: 'items_orderQty',    label: 'Total Order Qty',  width: '120px', align: 'right' },
  { key: 'items_scheduleQty', label: 'Total Sched Qty',  width: '120px', align: 'right' },
  { key: 'items_deliveryDate',label: 'Schedule Date(s)', width: '140px' },
  { key: 'status',            label: 'Status',           width: '130px' },
  { key: 'remark',            label: 'Remarks',          width: '140px' },
];

// ── Zod schemas ──────────────────────────────────────────────────────────────
const scheduleSchema = z.object({
  scheduleQty: z.coerce.number().min(1, 'Quantity required'),
  deliveryDate: z.string().min(1, 'Date required'),
});

const itemSchema = z.object({
  partNo:      z.string().optional(),
  productName: z.string().optional(),
  hsnCode:     z.string().optional(),
  orderQty:    z.coerce.number().min(1, 'Valid quantity required'),
  uom:         z.string().optional(),
  price:       z.coerce.number().optional().or(z.literal('')),
  schedules:   z.array(scheduleSchema).min(1, 'At least one schedule is required'),
});

const purchaseOrderSchema = z.object({
  createdDate:     z.string().optional(),
  date:            z.string().optional(),
  poNo:            z.string().min(1, 'PO Number is required'),
  npplPoNo:        z.string().optional(),
  vendorName:      z.string().min(1, 'Vendor name is required'),
  vendorAddress:   z.string().optional(),
  shippingAddress: z.string().optional(),
  items:           z.array(itemSchema).min(1, 'At least one item is required'),
  paymentTerms:    z.string().optional(),
  deliveryTerms:   z.string().optional(),
  status:          z.string().optional(),
  remark:          z.string().optional(),
});

// ── Field wrapper ────────────────────────────────────────────────────────────
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

// ── DatePicker helper ────────────────────────────────────────────────────────
function AppDatePicker({ value, onChange, isDisabled, label, inputCls }) {
  return (
    <DatePicker
      value={value ? parseDate(value) : null}
      isDisabled={isDisabled}
      onChange={(dateVal) => onChange(dateVal ? dateVal.toString() : '')}
      className="w-full"
      aria-label={label}
    >
      <DateField.Group className={`${inputCls} flex items-center overflow-hidden h-[42px] !pr-2 !py-0`} fullWidth>
        <DateField.Input className="flex-1 px-3 py-2 outline-none bg-transparent">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="pr-2">
          <DatePicker.Trigger className={`text-slate-500 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:text-emerald-600 transition-colors'}`}>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <HeroCalendar aria-label={label}>
          <HeroCalendar.Header>
            <HeroCalendar.YearPickerTrigger>
              <HeroCalendar.YearPickerTriggerHeading />
              <HeroCalendar.YearPickerTriggerIndicator />
            </HeroCalendar.YearPickerTrigger>
            <div className="flex items-center gap-1">
              <HeroCalendar.NavButton slot="previous" />
              <HeroCalendar.NavButton slot="next" />
            </div>
          </HeroCalendar.Header>
          <HeroCalendar.Grid>
            <HeroCalendar.GridHeader>
              {(day) => <HeroCalendar.HeaderCell>{day}</HeroCalendar.HeaderCell>}
            </HeroCalendar.GridHeader>
            <HeroCalendar.GridBody>
              {(date) => <HeroCalendar.Cell date={date} />}
            </HeroCalendar.GridBody>
          </HeroCalendar.Grid>
          <HeroCalendar.YearPickerGrid>
            <HeroCalendar.YearPickerGridBody>
              {({ year }) => <HeroCalendar.YearPickerCell year={year} />}
            </HeroCalendar.YearPickerGridBody>
          </HeroCalendar.YearPickerGrid>
        </HeroCalendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

// ── Item Schedules sub-form ──────────────────────────────────────────────────
function ItemSchedules({ control, itemIndex, isView, inputCls, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `items.${itemIndex}.schedules`
  });

  return (
    <div className="col-span-1 md:col-span-2 xl:col-span-4 mt-2 bg-slate-50/50 rounded-lg p-4 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
          <span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span>
          Delivery Schedules
        </h4>
        {!isView && (
          <button
            type="button"
            onClick={() => append({ scheduleQty: '', deliveryDate: '' })}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md transition-colors border border-emerald-200"
          >
            <Plus size={12} /> Add Schedule
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {fields.map((field, sIndex) => (
          <div key={field.id} className="flex items-start gap-3 relative group">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Controller
                control={control}
                name={`items.${itemIndex}.schedules.${sIndex}.scheduleQty`}
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Schedule Qty" required error={errors?.items?.[itemIndex]?.schedules?.[sIndex]?.scheduleQty?.message}>
                    <Input
                      type="number"
                      value={value || ''}
                      disabled={isView}
                      placeholder="0"
                      onChange={onChange}
                      ref={ref}
                      className={`${inputCls} px-3 py-2 h-[42px]`}
                      aria-label="Schedule Qty"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`items.${itemIndex}.schedules.${sIndex}.deliveryDate`}
                render={({ field: { onChange, value } }) => (
                  <Field label="Schedule Date" required error={errors?.items?.[itemIndex]?.schedules?.[sIndex]?.deliveryDate?.message}>
                    <AppDatePicker
                      value={value}
                      onChange={onChange}
                      isDisabled={isView}
                      label="Schedule Date"
                      inputCls={inputCls}
                    />
                  </Field>
                )}
              />
            </div>
            {!isView && fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(sIndex)}
                className="mt-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                title="Remove schedule"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Purchase Order Form ──────────────────────────────────────────────────────
function PurchaseOrderForm({ mode, order, onBack }) {
  const {
    addOrder, updateOrder, purchaseOrderLookups,
    addPurchaseOrderLookupOption, renamePurchaseOrderLookupOption, deletePurchaseOrderLookupOption,
    openDeleteConfirm,
  } = usePurchaseOrderStore();
  const { parties: partyMasterItems } = usePartyMasterStore();
  const { currentOrg, currentUser } = useAuthStore();

  const [freshItems, setFreshItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (currentOrg?.id) {
        const { data, error } = await supabase
          .from('item_master')
          .select('item_code, item_name')
          .eq('org_id', currentOrg.id);
        if (!error && data) setFreshItems(data);
      }
    };
    fetchItems();
  }, [currentOrg]);

  const getInitialValues = () => {
    if (order) {
      let items = order.items || [];
      if (items.length === 0) {
        items = [{ ...EMPTY_ORDER.items[0] }];
      } else {
        items = items.map(item => {
          if (!item.schedules || item.schedules.length === 0) {
            return { ...item, schedules: [{ scheduleQty: item.scheduleQty || item.orderQty || '', deliveryDate: item.deliveryDate || '' }] };
          }
          return item;
        });
      }
      return { ...EMPTY_ORDER, ...order, items };
    }
    return { ...EMPTY_ORDER };
  };

  const { control, handleSubmit: hookFormSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: getInitialValues(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => { reset(getInitialValues()); }, [order, mode]);

  const isView = mode === 'view';
  const isAdd  = mode === 'add';

  // All parties (or filter by Supplier category if set)
  const vendorParties = (partyMasterItems || []).filter(p =>
    !p.partyCategory || p.partyCategory === 'Supplier' || p.partyCategory === 'Vendor' || p.partyCategory === 'Customer' || true
  );

  const onSubmit = async (data) => {
    const finalForm = { ...data };
    finalForm.items = (finalForm.items || []).filter(item =>
      item.partNo || item.productName || item.hsnCode || item.uom || item.price || item.orderQty || (item.schedules && item.schedules.length > 0)
    );
    if (finalForm.items.length === 0) finalForm.items = [{ ...EMPTY_ORDER.items[0] }];

    if (isAdd) await addOrder(finalForm, currentOrg?.id, currentUser?.id);
    else await updateOrder(order.id, finalForm, currentUser?.id);
    onBack();
  };

  const inputCls = "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

  return (
    <div className="animate-slide-up">
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 flex items-center justify-center transition-all"
              title="Back to table"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-200 shadow-lg shadow-indigo-500/10">
              {isView ? <Eye size={24} className="text-indigo-600" /> : <ShoppingCart size={24} className="text-indigo-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Purchase Order' : isAdd ? 'Create Purchase Order' : 'Edit Purchase Order'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watch('poNo') ? `${watch('poNo')}${watch('npplPoNo') ? ` • ${watch('npplPoNo')}` : ''}` : 'Fill the details below'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <X size={16} /> Back
            </button>
            {!isView && (
              <button
                type="submit"
                form="po-purchase-form"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
              >
                {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                {isAdd ? 'Create PO' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="po-purchase-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-7">
            <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
              {/* Section title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Tag size={15} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Order Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {/* Created Date (read-only) */}
                <Controller
                  control={control}
                  name="createdDate"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Created Date">
                      <AppDatePicker
                        value={value || watch('date')}
                        onChange={onChange}
                        isDisabled={true}
                        label="Created Date"
                        inputCls={`${inputCls} h-[46px]`}
                      />
                    </Field>
                  )}
                />

                {/* PO Date */}
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, value } }) => (
                    <Field label="PO Date">
                      <AppDatePicker
                        value={value}
                        onChange={onChange}
                        isDisabled={!isAdd}
                        label="PO Date"
                        inputCls={`${inputCls} h-[46px]`}
                      />
                    </Field>
                  )}
                />

                {/* PO Number */}
                <Controller
                  control={control}
                  name="poNo"
                  render={({ field: { onChange, value, ref } }) => (
                    <Field label="PO Number" required error={errors.poNo?.message}>
                      <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="PO-2024-XXXX" className={`${inputCls} px-4 py-3`} aria-label="PO Number" />
                    </Field>
                  )}
                />

                {/* PO Reference No */}
                <Controller
                  control={control}
                  name="npplPoNo"
                  render={({ field: { onChange, value, ref } }) => (
                    <Field label="NPPL Purchase Order No." error={errors.npplPoNo?.message}>
                      <Input type="text" value={value || ''} disabled={true} onChange={onChange} ref={ref} placeholder="Auto-generated (e.g. PO-0001)" className={`${inputCls} px-4 py-3 bg-slate-50 text-slate-600`} aria-label="NPPL Purchase Order No." />
                    </Field>
                  )}
                />

                {/* Vendor Name */}
                <Controller
                  control={control}
                  name="vendorName"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Vendor Name" required error={errors.vendorName?.message}>
                      <Select
                        value={value || null}
                        onChange={async val => {
                          if (!val) return;
                          onChange(val);
                          if (currentOrg?.id) {
                            const { data, error } = await supabase
                              .from('party_master')
                              .select('address')
                              .eq('party_name', val)
                              .eq('org_id', currentOrg.id)
                              .maybeSingle();
                            if (!error && data) {
                              setValue('vendorAddress', data.address || '');
                            } else {
                              const party = vendorParties.find(p => p.partyName === val);
                              setValue('vendorAddress', party?.address || '');
                            }
                          } else {
                            const party = vendorParties.find(p => p.partyName === val);
                            setValue('vendorAddress', party?.address || '');
                          }
                        }}
                        isDisabled={isView}
                        className="w-full"
                        aria-label="Vendor Name"
                      >
                        <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                          <Select.Value placeholder="Select Vendor" />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {vendorParties.map(p => (
                              <ListBox.Item key={p.partyName} id={p.partyName} textValue={p.partyName}>
                                <div className="flex flex-col gap-0.5 py-0.5">
                                  <span className="font-bold text-slate-800">{p.partyName}</span>
                                  {p.partyCategory && <span className="text-xs text-slate-400">{p.partyCategory}</span>}
                                </div>
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </Field>
                  )}
                />

                {/* Vendor Address (auto-filled) */}
                {watch('vendorAddress') && (
                  <Field label="Vendor Address" wide>
                    <textarea
                      value={watch('vendorAddress')}
                      disabled={true}
                      className={`${inputCls} min-h-[60px] resize-y px-4 py-3 bg-slate-50 text-slate-600`}
                      readOnly
                    />
                  </Field>
                )}

                {/* Shipping Address */}
                <Controller
                  control={control}
                  name="shippingAddress"
                  render={({ field: { onChange, value, ref } }) => (
                    <Field label="Shipping Address" wide>
                      <textarea
                        value={value || ''}
                        disabled={isView}
                        onChange={onChange}
                        ref={ref}
                        className={`${inputCls} min-h-[60px] resize-y px-4 py-3`}
                        placeholder="Enter shipping address..."
                      />
                    </Field>
                  )}
                />

                {/* Payment Terms */}
                <Controller
                  control={control}
                  name="paymentTerms"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Payment Terms">
                      <EditableCreatableSelect
                        value={value}
                        options={purchaseOrderLookups.paymentTerms || []}
                        disabled={isView}
                        placeholder="Select or enter payment terms"
                        onChange={onChange}
                        onAdd={(newOption) => addPurchaseOrderLookupOption('paymentTerms', newOption)}
                        onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('paymentTerms', oldOption, newOption)}
                        onDelete={(option) => deletePurchaseOrderLookupOption('paymentTerms', option)}
                      />
                    </Field>
                  )}
                />

                {/* Delivery Terms */}
                <Controller
                  control={control}
                  name="deliveryTerms"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Delivery Terms">
                      <EditableCreatableSelect
                        value={value}
                        options={purchaseOrderLookups.deliveryTerms || []}
                        disabled={isView}
                        placeholder="Select or enter delivery terms"
                        onChange={onChange}
                        onAdd={(newOption) => addPurchaseOrderLookupOption('deliveryTerms', newOption)}
                        onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('deliveryTerms', oldOption, newOption)}
                        onDelete={(option) => deletePurchaseOrderLookupOption('deliveryTerms', option)}
                      />
                    </Field>
                  )}
                />

                {/* Status */}
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Status">
                      <EditableCreatableSelect
                        value={value}
                        options={purchaseOrderLookups.status || ['Draft', 'Pending', 'Approved', 'Completed', 'Cancelled']}
                        disabled={isView}
                        placeholder="Select status"
                        onChange={onChange}
                        onAdd={(newOption) => addPurchaseOrderLookupOption('status', newOption)}
                        onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('status', oldOption, newOption)}
                        onDelete={(option) => deletePurchaseOrderLookupOption('status', option)}
                      />
                    </Field>
                  )}
                />

                {/* Items Section */}
                <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList size={16} className="text-indigo-500" />
                      Item Details
                    </h3>
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => append({ ...EMPTY_ORDER.items[0] })}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 shadow-sm"
                      >
                        <Plus size={14} /> Add Item
                      </button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="relative bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item #{index + 1}</span>
                        {!isView && fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-red-500 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* Part Number */}
                        <Controller
                          control={control}
                          name={`items.${index}.partNo`}
                          render={({ field: { onChange, value } }) => (
                            <Field label="Part Number">
                              {isView ? (
                                <Input type="text" value={value || ''} disabled readOnly className={`${inputCls} px-4 py-3 bg-slate-50 text-slate-600`} aria-label="Part Number" />
                              ) : (
                                <Select
                                  value={value || null}
                                  onChange={(val) => {
                                    if (!val) return;
                                    onChange(val);
                                    const matchedItem = freshItems.find(i => i.item_code === val);
                                    if (matchedItem) {
                                      setValue(`items.${index}.productName`, matchedItem.item_name || '', { shouldValidate: true, shouldDirty: true });
                                    }
                                  }}
                                  className="w-full"
                                  aria-label="Part Number"
                                >
                                  <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                                    <Select.Value placeholder="Select Part Number" />
                                  </Select.Trigger>
                                  <Select.Popover>
                                    <ListBox>
                                      {freshItems.filter(itm => itm.item_code).map(itm => (
                                        <ListBox.Item key={itm.item_code} id={itm.item_code} textValue={itm.item_code}>
                                          <div className="flex flex-col gap-0.5 py-0.5">
                                            <span className="font-bold text-slate-800">{itm.item_code}</span>
                                          </div>
                                        </ListBox.Item>
                                      ))}
                                    </ListBox>
                                  </Select.Popover>
                                </Select>
                              )}
                            </Field>
                          )}
                        />

                        {/* Product Name (auto-filled) */}
                        <Controller
                          control={control}
                          name={`items.${index}.productName`}
                          render={({ field: { value } }) => (
                            <Field label="Product Name" wide>
                              <Input
                                type="text"
                                value={value || ''}
                                disabled
                                readOnly
                                placeholder="Auto-filled from Part Number"
                                className={`${inputCls} px-4 py-3 bg-slate-50 text-slate-600`}
                                aria-label="Product Name"
                              />
                            </Field>
                          )}
                        />

                        {/* HSN Code */}
                        <Controller
                          control={control}
                          name={`items.${index}.hsnCode`}
                          render={({ field: { onChange, value, ref } }) => (
                            <Field label="HSN Code">
                              <Input type="text" value={value || ''} disabled={isView} placeholder="HSN Code" onChange={onChange} ref={ref} className={`${inputCls} px-4 py-3`} aria-label="HSN Code" />
                            </Field>
                          )}
                        />

                        {/* Order Qty */}
                        <Controller
                          control={control}
                          name={`items.${index}.orderQty`}
                          render={({ field: { onChange, value, ref } }) => (
                            <Field label="Order Qty" required error={errors?.items?.[index]?.orderQty?.message}>
                              <Input type="number" value={value || ''} disabled={isView} placeholder="0" onChange={onChange} ref={ref} className={`${inputCls} px-4 py-3`} aria-label="Order Qty" />
                            </Field>
                          )}
                        />

                        {/* UOM */}
                        <Controller
                          control={control}
                          name={`items.${index}.uom`}
                          render={({ field: { onChange, value } }) => (
                            <Field label="UOM">
                              <EditableCreatableSelect
                                value={value || ''}
                                options={purchaseOrderLookups.uom || []}
                                disabled={isView}
                                placeholder="Select UOM"
                                onChange={onChange}
                                onAdd={(newOption) => addPurchaseOrderLookupOption('uom', newOption)}
                                onRename={(oldOption, newOption) => renamePurchaseOrderLookupOption('uom', oldOption, newOption)}
                                onDelete={(option) => deletePurchaseOrderLookupOption('uom', option)}
                              />
                            </Field>
                          )}
                        />

                        {/* Price */}
                        <Controller
                          control={control}
                          name={`items.${index}.price`}
                          render={({ field: { onChange, value, ref } }) => (
                            <Field label="Price">
                              <Input type="number" value={value || ''} disabled={isView} placeholder="0.00" onChange={onChange} ref={ref} className={`${inputCls} px-4 py-3`} aria-label="Price" />
                            </Field>
                          )}
                        />

                        {/* Schedules */}
                        <ItemSchedules
                          control={control}
                          itemIndex={index}
                          isView={isView}
                          inputCls={inputCls}
                          errors={errors}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remarks */}
                <Controller
                  control={control}
                  name="remark"
                  render={({ field: { onChange, value, ref } }) => (
                    <Field label="Remarks" wide>
                      <textarea
                        value={value || ''}
                        disabled={isView}
                        onChange={onChange}
                        ref={ref}
                        className={`${inputCls} min-h-28 resize-y px-4 py-3`}
                        placeholder="Additional notes..."
                      />
                    </Field>
                  )}
                />
              </div>
            </section>
          </div>

          {/* Bottom action bar */}
          {!isView && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
              <div>
                {!isAdd && (
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(order)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                  >
                    <Trash2 size={16} /> Delete Order
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
                >
                  {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                  {isAdd ? 'Create PO' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PurchaseOrdersPage() {
  const {
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    sortField, sortDirection, setSortField,
    getFilteredOrders, deleteOrder, getStats, orders, purchaseOrderLookups,
    fetchOrders, isLoading,
    isDeleteConfirmOpen, orderToDelete, openDeleteConfirm, closeDeleteConfirm,
  } = usePurchaseOrderStore();
  const { currentOrg } = useAuthStore();
  const { fetchParties } = usePartyMasterStore();
  const { fetchItems } = useItemMasterStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchOrders(currentOrg.id);
      fetchParties(currentOrg.id);
      fetchItems(currentOrg.id);
    }
  }, [currentOrg?.id]);

  const [viewState, setViewState] = useState({ type: 'table', mode: null, order: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const allStatuses = ['All', ...(purchaseOrderLookups?.status || ['Draft', 'Pending', 'Approved', 'Completed', 'Cancelled'])];

  const filtered = getFilteredOrders();
  const stats = getStats();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openForm = (mode, order = null) => setViewState({ type: 'form', mode, order });
  const backToTable = () => setViewState({ type: 'table', mode: null, order: null });
  const clearFilters = () => { setSearchQuery(''); setFilterStatus('All'); };

  const exportCsv = () => {
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(order => COLUMNS.map(col => {
      const val = renderCellText(order, col);
      return String(val ?? '').replaceAll('"', '""');
    }));
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'purchase-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellText = (order, column) => {
    if (column.key?.startsWith('items_')) {
      const items = order.items || [];
      if (column.key === 'items_partNo') return items.map(i => i.partNo).filter(Boolean).join(', ');
      if (column.key === 'items_productName') return items.map(i => i.productName).filter(Boolean).join(', ');
      if (column.key === 'items_orderQty') return items.reduce((s, i) => s + Number(i.orderQty || 0), 0);
      if (column.key === 'items_scheduleQty') return items.reduce((s, i) => s + (i.schedules || []).reduce((ss, sc) => ss + Number(sc.scheduleQty || 0), 0), 0);
      if (column.key === 'items_deliveryDate') {
        const allDates = items.flatMap(i => (i.schedules || []).map(s => s.deliveryDate).filter(Boolean));
        return [...new Set(allDates)].join(', ');
      }
    }
    return order[column.key] ?? '';
  };

  const renderCellValue = (order, column) => {
    const value = order[column.key];
    const dateFormatted = formatTableDate(value, column.key);
    if (dateFormatted !== null) return dateFormatted;


    if (column.key === 'poNo') {
      return (
        <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }
    if (column.key === 'npplPoNo') {
      return (
        <span className="inline-flex items-center gap-1.5 text-slate-600 font-bold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
          <Tag size={12} /> {value || '-'}
        </span>
      );
    }
    if (column.key === 'vendorName') {
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
        const sum = items.reduce((s, i) => s + (i.schedules || []).reduce((ss, sc) => ss + Number(sc.scheduleQty || 0), 0), 0);
        return <span className="text-slate-700 font-bold">{sum.toLocaleString()}</span>;
      }
      if (column.key === 'items_deliveryDate') {
        const allDates = items.flatMap(i => (i.schedules || []).map(s => s.deliveryDate).filter(Boolean));
        const uniqueDates = [...new Set(allDates)];
        const val = uniqueDates.join(', ');
        return <span className="font-semibold text-slate-700 whitespace-nowrap" title={val}>{uniqueDates.length > 2 ? `${uniqueDates.length} Dates` : (val || '-')}</span>;
      }
    }
    if (column.key === 'status') {
      const s = STATUS_STYLES[value] || {};
      return (
        <span
          className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm"
          style={{ background: s.bg || 'rgba(100,116,139,0.12)', color: s.text || '#64748b', border: `1px solid ${s.border || 'rgba(100,116,139,0.2)'}` }}
        >
          {value || '-'}
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
      {/* Stats cards */}
      {viewState.type !== 'form' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Total POs"  value={stats.total.toLocaleString()}     icon={ShoppingCart}  color="#6366f1" bg="rgba(99,102,241,0.12)"  border="rgba(99,102,241,0.25)"  animationDelay={0}   />
          <StatsCard label="Pending"    value={stats.pending.toLocaleString()}   icon={Activity}      color="#f59e0b" bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.25)" animationDelay={50}  />
          <StatsCard label="Approved"   value={stats.approved.toLocaleString()}  icon={CheckCircle}   color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.25)" animationDelay={100} />
          <StatsCard label="Completed"  value={stats.completed.toLocaleString()} icon={BadgeCheck}    color="#6366f1" bg="rgba(99,102,241,0.12)"  border="rgba(99,102,241,0.25)"  animationDelay={150} />
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
          {/* Filters toolbar */}
          <div className="glass-card rounded-2xl p-5 shadow-xl mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full min-w-0 group">
                <Input
                  type="text"
                  placeholder="Search by PO No, Vendor, Product, Part No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search purchase orders"
                  className="w-full pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-indigo-500/50 bg-white border border-slate-200"
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <Select value={filterStatus} onChange={setFilterStatus} className="w-[160px]" aria-label="Status Filter">
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {allStatuses.map(s => <ListBox.Item key={s} id={s} textValue={s === 'All' ? 'All Status' : s}>{s === 'All' ? 'All Status' : s}</ListBox.Item>)}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="flex gap-3 w-full xl:w-auto shrink-0">
                <button onClick={exportCsv} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all flex-1 xl:flex-none">
                  <FileDown size={18} /> Export
                </button>
                <button
                  onClick={() => openForm('add')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30 flex-1 xl:flex-none"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
                >
                  <Plus size={18} strokeWidth={2.5} /> Add PO
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{orders.length}</span> purchase orders
              </p>
              {(searchQuery || filterStatus !== 'All') && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  <RefreshCw size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl pb-4">
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label="Purchase orders table"
                  className="text-left"
                  style={{ minWidth: '2200px' }}
                  sortDescriptor={{ column: sortField, direction: sortDirection === 'asc' ? 'ascending' : 'descending' }}
                  onSortChange={(descriptor) => setSortField(descriptor.column)}
                >
                  <Table.Header>
                    <Table.Column isRowHeader className="w-28 whitespace-nowrap">Actions</Table.Column>
                    {COLUMNS.map((col, index) => (
                      <Table.Column
                        key={col.key}
                        id={col.key}
                        isRowHeader={index === 0}
                        allowsSorting
                        className="whitespace-nowrap"
                        style={{ minWidth: col.width, textAlign: col.align || 'left' }}
                      >
                        {({ sortDirection }) => (
                          <span className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : ''}`}>
                            {col.label}
                            <SortIcon sortDirection={sortDirection} />
                          </span>
                        )}
                      </Table.Column>
                    ))}
                  </Table.Header>
                  <Table.Body
                    items={pagedOrders}
                    loadingState={isLoading ? 'loading' : 'idle'}
                    loadingContent={<Spinner size="lg" color="primary" />}
                    renderEmptyState={() =>
                      isLoading ? null : (
                        <div className="py-24 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                              <ShoppingCart size={32} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-medium">No purchase orders found. Try adjusting your filters or create one.</p>
                          </div>
                        </div>
                      )
                    }
                  >
                    {(order) => (
                      <Table.Row key={order.id} className="group">
                        <Table.Cell>
                          <div className="flex items-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                            <button onClick={() => openForm('view', order)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all" title="View">
                              <Eye size={15} />
                            </button>
                            <button onClick={() => openForm('edit', order)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all" title="Edit">
                              <Edit size={15} />
                            </button>
                          </div>
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <span>Rows per page:</span>
                <Select value={itemsPerPage.toString()} onChange={(val) => val && setItemsPerPage(Number(val))} className="w-[80px]" aria-label="Rows per page">
                  <Select.Trigger className="px-3 py-1.5 h-auto min-h-[34px] rounded-lg text-slate-700 bg-white border border-slate-200 outline-none hover:bg-slate-50 transition-colors">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {[5, 10, 20, 50].map(count => (
                        <ListBox.Item key={count.toString()} id={count.toString()} textValue={count.toString()}>{count}</ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Previous</button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${currentPage === page ? 'text-white shadow-lg shadow-indigo-500/30' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'}`}
                        style={currentPage === page ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: '1px solid #6366f1' } : {}}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next</button>
              </div>

              <p className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{currentPage}</span> of{' '}
                <span className="text-slate-800">{totalPages || 1}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {isDeleteConfirmOpen && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Purchase Order?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete PO <span className="font-bold text-slate-700">{orderToDelete.poNo || orderToDelete.id?.split('-')[0]}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={closeDeleteConfirm} disabled={isDeleting} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all">Cancel</button>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    await deleteOrder(orderToDelete.id);
                    setIsDeleting(false);
                    setViewState({ type: 'table', mode: null, order: null });
                  }}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  Yes, Delete It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
