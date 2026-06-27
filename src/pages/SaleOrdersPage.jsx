import { useState, useEffect } from 'react';

import {
  ArrowLeft, BadgeCheck,
  Edit, Eye, FileDown, Hash, Plus, RefreshCw, Save, Search, SlidersHorizontal,
  Tag, Trash2, X, ChevronUp, ChevronDown, ChevronsUpDown, Package, Activity, Truck, AlertCircle, Loader2
} from 'lucide-react';
import { Table, Input, Select, ListBox, DatePicker, DateField, Calendar as HeroCalendar } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StatsCard from '../components/common/StatsCard';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import { useSaleOrderStore } from '../store/saleOrderStore';
import { usePartyMasterStore } from '../store/partyMasterStore';
import { useAuthStore } from '../store/authStore';
import { useItemMasterStore } from '../store/itemMasterStore';
import { supabase } from '../lib/supabase';


const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_ORDER = {
  createdDate: todayIsoDate(),
  date: todayIsoDate(),
  poNo: '',
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
  { key: 'poNo', label: 'PO No', width: '140px' },
  { key: 'partyName', label: 'Party Name', width: '180px' },
  { key: 'items_partNo', label: 'Part No', width: '150px' },
  { key: 'items_productName', label: 'Product Name', width: '240px' },
  { key: 'items_orderQty', label: 'Total Order Qty', width: '120px', align: 'right' },
  { key: 'items_scheduleQty', label: 'Total Sched Qty', width: '120px', align: 'right' },
  { key: 'items_deliveryDate', label: 'Schedule Date(s)', width: '140px' },
  { key: 'remark', label: 'Remarks', width: '140px' },
];

const itemSchema = z.object({
  partNo: z.string().optional(),
  productName: z.string().optional(),
  hsnCode: z.string().optional(),
  orderQty: z.coerce.number().min(1, 'Valid quantity required'),
  uom: z.string().optional(),
  price: z.coerce.number().optional().or(z.literal('')),
  scheduleQty: z.coerce.number().optional().or(z.literal('')),
  deliveryDate: z.string().min(1, 'Schedule date required'),
});

const saleOrderSchema = z.object({
  createdDate: z.string().optional(),
  date: z.string().optional(),
  poNo: z.string().min(1, 'PO Number is required'),
  partyName: z.string().min(1, 'Party name is required'),
  partyAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  remark: z.string().optional(),
});

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
    openDeleteConfirm,
  } = useSaleOrderStore();
  const { parties: partyMasterItems } = usePartyMasterStore();
  const { items: itemMasterItems } = useItemMasterStore();
  const { currentOrg, currentUser } = useAuthStore();

  const [freshItems, setFreshItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (currentOrg?.id) {
        const { data, error } = await supabase
          .from('item_master')
          .select('item_code, item_name')
          .eq('org_id', currentOrg.id);
        if (!error && data) {
          setFreshItems(data);
        }
      }
    };
    fetchItems();
  }, [currentOrg]);

  const getInitialValues = () => {
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
  };

  const { control, handleSubmit: hookFormSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: getInitialValues()
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  useEffect(() => {
    reset(getInitialValues());
  }, [order, mode, reset]);

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const customerParties = (partyMasterItems || []).filter(p => p.partyCategory === 'Customer');

  const onSubmit = async (data) => {
    const finalForm = { ...data };

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


    if (isAdd) await addOrder(finalForm, currentOrg?.id, currentUser?.id);
    else await updateOrder(order.id, finalForm, currentUser?.id);
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
                {watch('poNo') || 'Fill the details below'}
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
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                {isAdd ? 'Create Order' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="po-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-7">
            <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Tag size={15} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Order Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                <Controller
                  control={control}
                  name="createdDate"
                  render={({ field: { onChange, value } }) => {
                    const dateVal = value || watch('date');
                    return (
                      <Field label="Created Date">
                        <DatePicker
                          value={dateVal ? parseDate(dateVal) : null}
                          isDisabled={true}
                          onChange={(v) => onChange(v ? v.toString() : '')}
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
                                <HeroCalendar.GridBody>{(date) => <HeroCalendar.Cell date={date} />}</HeroCalendar.GridBody>
                              </HeroCalendar.Grid>
                              <HeroCalendar.YearPickerGrid>
                                <HeroCalendar.YearPickerGridBody>
                                  {({year}) => <HeroCalendar.YearPickerCell year={year} />}
                                </HeroCalendar.YearPickerGridBody>
                              </HeroCalendar.YearPickerGrid>
                            </HeroCalendar>
                          </DatePicker.Popover>
                        </DatePicker>
                      </Field>
                    );
                  }}
                />

                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Purchase Date">
                      <DatePicker
                        value={value ? parseDate(value) : null}
                        isDisabled={!isAdd}
                        onChange={(v) => onChange(v ? v.toString() : '')}
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
                              <HeroCalendar.GridBody>{(date) => <HeroCalendar.Cell date={date} />}</HeroCalendar.GridBody>
                            </HeroCalendar.Grid>
                            <HeroCalendar.YearPickerGrid>
                              <HeroCalendar.YearPickerGridBody>
                                {({year}) => <HeroCalendar.YearPickerCell year={year} />}
                              </HeroCalendar.YearPickerGridBody>
                            </HeroCalendar.YearPickerGrid>
                          </HeroCalendar>
                        </DatePicker.Popover>
                      </DatePicker>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="poNo"
                  render={({ field: { onChange, value, ref } }) => (
                    <Field label="PO Number" required error={errors.poNo?.message}>
                      <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="SO2024-XXXX" className={`${inputCls} px-4 py-3`} aria-label="PO Number" />
                    </Field>
                  )}
                />



                <Controller
                  control={control}
                  name="partyName"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Party Name" required error={errors.partyName?.message}>
                      <Select
                        selectedKeys={value ? [value] : []}
                        onSelectionChange={async v => {
                          const partyName = v instanceof Set ? Array.from(v)[0] : String(v);
                          if (!partyName) return;
                          onChange(partyName);
                          if (currentOrg?.id) {
                            const { data, error } = await supabase
                              .from('party_master')
                              .select('address')
                              .eq('party_name', partyName)
                              .eq('org_id', currentOrg.id)
                              .maybeSingle();
                            if (!error && data) {
                              setValue('partyAddress', data.address || '');
                            } else {
                              const party = customerParties.find(p => p.partyName === partyName);
                              setValue('partyAddress', party?.address || '');
                            }
                          } else {
                            const party = customerParties.find(p => p.partyName === partyName);
                            setValue('partyAddress', party?.address || '');
                          }
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
                  )}
                />

                {watch('partyAddress') && (
                  <Field label="Party Address" wide>
                    <textarea
                      value={watch('partyAddress')}
                      disabled={true}
                      className={`${inputCls} min-h-[60px] resize-y px-4 py-3 bg-slate-50 text-slate-600`}
                      readOnly
                    />
                  </Field>
                )}

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

                <Controller
                  control={control}
                  name="paymentTerms"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Payment Terms">
                      <EditableCreatableSelect
                        value={value}
                        options={saleOrderLookups.paymentTerms || []}
                        disabled={isView}
                        placeholder="Select or enter payment terms"
                        onChange={onChange}
                        onAdd={(newOption) => addSaleOrderLookupOption('paymentTerms', newOption)}
                        onRename={(oldOption, newOption) => renameSaleOrderLookupOption('paymentTerms', oldOption, newOption)}
                        onDelete={(option) => deleteSaleOrderLookupOption('paymentTerms', option)}
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="deliveryTerms"
                  render={({ field: { onChange, value } }) => (
                    <Field label="Delivery Terms">
                      <EditableCreatableSelect
                        value={value}
                        options={saleOrderLookups.deliveryTerms || []}
                        disabled={isView}
                        placeholder="Select or enter delivery terms"
                        onChange={onChange}
                        onAdd={(newOption) => addSaleOrderLookupOption('deliveryTerms', newOption)}
                        onRename={(oldOption, newOption) => renameSaleOrderLookupOption('deliveryTerms', oldOption, newOption)}
                        onDelete={(option) => deleteSaleOrderLookupOption('deliveryTerms', option)}
                      />
                    </Field>
                  )}
                />

                <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Package size={16} className="text-emerald-500" />
                      Item Details
                    </h3>
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => append({ ...EMPTY_ORDER.items[0] })}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 shadow-sm"
                      >
                        <Plus size={14} /> Add Item
                      </button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="relative bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Item #{index + 1}
                        </span>
                        {!isView && fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-red-500 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Remove item"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                          <Controller
                            control={control}
                            name={`items.${index}.partNo`}
                            render={({ field: { onChange, value } }) => (
                              <Field label="Part Number">
                                {isView ? (
                                  <Input
                                    type="text"
                                    value={value || ''}
                                    disabled
                                    readOnly
                                    className={`${inputCls} px-4 py-3 bg-slate-50 text-slate-600`}
                                    aria-label="Part Number"
                                  />
                                ) : (
                                  <Select
                                    selectedKeys={value ? [value] : []}
                                    onSelectionChange={(v) => {
                                      const partNo = v instanceof Set ? Array.from(v)[0] : String(v);
                                      if (!partNo) return;
                                      onChange(partNo);
                                      
                                      const matchedItem = freshItems.find(i => i.item_code === partNo);
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

                          <Controller
                            control={control}
                            name={`items.${index}.hsnCode`}
                            render={({ field: { onChange, value, ref } }) => (
                              <Field label="HSN Code">
                                <Input
                                  type="text"
                                  value={value || ''}
                                  disabled={isView}
                                  placeholder="HSN Code"
                                  onChange={onChange}
                                  ref={ref}
                                  className={`${inputCls} px-4 py-3`}
                                  aria-label="HSN Code"
                                />
                              </Field>
                            )}
                          />
                          
                          <Controller
                            control={control}
                            name={`items.${index}.orderQty`}
                            render={({ field: { onChange, value, ref } }) => (
                              <Field label="Order Qty" required error={errors?.items?.[index]?.orderQty?.message}>
                                <Input
                                  type="number"
                                  value={value || ''}
                                  disabled={isView}
                                  placeholder="0"
                                  onChange={onChange}
                                  ref={ref}
                                  className={`${inputCls} px-4 py-3`}
                                  aria-label="Order Qty"
                                />
                              </Field>
                            )}
                          />

                          <Controller
                            control={control}
                            name={`items.${index}.uom`}
                            render={({ field: { onChange, value } }) => (
                              <Field label="UOM">
                                <EditableCreatableSelect
                                  value={value || ''}
                                  options={saleOrderLookups.uom || []}
                                  disabled={isView}
                                  placeholder="Select UOM"
                                  onChange={onChange}
                                  onAdd={(newOption) => addSaleOrderLookupOption('uom', newOption)}
                                  onRename={(oldOption, newOption) => renameSaleOrderLookupOption('uom', oldOption, newOption)}
                                  onDelete={(option) => deleteSaleOrderLookupOption('uom', option)}
                                />
                              </Field>
                            )}
                          />

                          <Controller
                            control={control}
                            name={`items.${index}.price`}
                            render={({ field: { onChange, value, ref } }) => (
                              <Field label="Price">
                                <Input
                                  type="number"
                                  value={value || ''}
                                  disabled={isView}
                                  placeholder="0.00"
                                  onChange={onChange}
                                  ref={ref}
                                  className={`${inputCls} px-4 py-3`}
                                  aria-label="Price"
                                />
                              </Field>
                            )}
                          />

                          <Controller
                            control={control}
                            name={`items.${index}.scheduleQty`}
                            render={({ field: { onChange, value, ref } }) => (
                              <Field label="Schedule Qty">
                                <Input
                                  type="number"
                                  value={value || ''}
                                  disabled={isView}
                                  placeholder="0"
                                  onChange={onChange}
                                  ref={ref}
                                  className={`${inputCls} px-4 py-3`}
                                  aria-label="Schedule Qty"
                                />
                              </Field>
                            )}
                          />

                          <Controller
                            control={control}
                            name={`items.${index}.deliveryDate`}
                            render={({ field: { onChange, value } }) => (
                              <Field label="Schedule Date" required error={errors?.items?.[index]?.deliveryDate?.message}>
                                <DatePicker
                                  value={value ? parseDate(value) : null}
                                  isDisabled={isView}
                                  onChange={(dateVal) => onChange(dateVal ? dateVal.toString() : '')}
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
                                    <HeroCalendar aria-label="Order Date">
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
                                          {({year}) => <HeroCalendar.YearPickerCell year={year} />}
                                        </HeroCalendar.YearPickerGridBody>
                                      </HeroCalendar.YearPickerGrid>
                                    </HeroCalendar>
                                  </DatePicker.Popover>
                                </DatePicker>
                              </Field>
                            )}
                          />
                        </div>
                      </div>
                  ))}
                </div>


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

          {!isView && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
              <div>
                {!isAdd && (
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(order)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete Order
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
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
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
                >
                  {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                  {isAdd ? 'Create Order' : 'Save Changes'}
                </button>
              </div>
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
    sortField, sortDirection, setSortField,
    getFilteredOrders, deleteOrder, getStats, orders, saleOrderLookups,
    fetchOrders, isLoading,
    isDeleteConfirmOpen, orderToDelete, openDeleteConfirm, closeDeleteConfirm
  } = useSaleOrderStore();
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


  const allStatuses = ['All', ...(saleOrderLookups?.finalStatus || [])];
  const allPriorities = ['All', ...(saleOrderLookups?.priority || [])];

  const filtered = getFilteredOrders();
  const stats = getStats();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openForm = (mode, order = null) => {
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

    if (column.key === 'poNo') {
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
                  onSelectionChange={v => setFilterStatus(v instanceof Set ? Array.from(v)[0] : String(v))}
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
                  onSelectionChange={v => setFilterPriority(v instanceof Set ? Array.from(v)[0] : String(v))}
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
      {isDeleteConfirmOpen && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Sale Order?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete order <span className="font-bold text-slate-700">{orderToDelete.poNo || orderToDelete.id.split('-')[0]}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  Cancel
                </button>
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
