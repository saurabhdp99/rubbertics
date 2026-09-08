import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Truck,
  Eye,
  Save,
  X,
  Trash2,
  FileText,
  PackageSearch,
  MapPin,
  ClipboardList,
  Calendar,
  Building2,
  Hash,
  Boxes,
  Scale,
  Car,
  Phone,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useDispatchStore } from '../../store/dispatchStore';
import { useSaleOrderStore } from '../../store/saleOrderStore';
import { usePartyMasterStore } from '../../store/partyMasterStore';
import { useTransportMasterStore } from '../../store/transportMasterStore';
import { useItemMasterStore } from '../../store/itemMasterStore';
import { useAuthStore } from '../../store/authStore';
import { DISPATCH_STATUS_OPTIONS, getNextInvoiceNo, getNextSrNo } from '../../data/dispatchTemplate';

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const dispatchSchema = z.object({
  srNo: z.coerce.number().optional(),
  invDate: z.string().min(1, 'Invoice date is required'),
  invoiceNo: z.string().min(1, 'Delivery Challan No. is required'),
  saleOrderNo: z.string().min(1, 'Sale Order No is required'),
  partyName: z.string().min(1, 'Party Name is required'),
  partNo: z.string().optional(),
  materialDescription: z.string().min(1, 'Material description is required'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0'),
  transport: z.string().min(1, 'Transport name is required'),
  vehicleNo: z.string().optional(),
  lrNo: z.string().optional(),
  lrDate: z.string().optional(),
  noOfBags: z.string().optional(),
  dispatchStatus: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  remarks: z.string().optional(),
});

const baseInputClass =
  'w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';
const inputCls = `${baseInputClass} px-4 py-3 h-[46px]`;
const selectCls = `${baseInputClass} px-4 py-3 h-[46px]`;

function Section({ title, icon: Icon, children }) {
  return (
    <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon size={16} className="text-emerald-600" />
        </div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, required, error, colClass = 'col-span-1' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${colClass}`}>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-500 font-semibold ml-1">{error}</span>}
    </div>
  );
}

export default function DispatchForm({ mode = 'add', dispatch = null, onBack }) {
  const { dispatches, addDispatch, updateDispatch, setDeleteConfirmOpen } = useDispatchStore();
  const { orders, fetchOrders } = useSaleOrderStore();
  const { parties, fetchParties } = usePartyMasterStore();
  const { transporters, fetchTransporters } = useTransportMasterStore();
  const { items, fetchItems } = useItemMasterStore();
  const { currentOrg } = useAuthStore();

  useEffect(() => {
    if (currentOrg?.id) {
      if (orders.length === 0) fetchOrders(currentOrg.id);
      if (parties.length === 0) fetchParties(currentOrg.id);
      if (transporters.length === 0) fetchTransporters(currentOrg.id);
      if (items.length === 0) fetchItems(currentOrg.id);
    }
  }, [currentOrg]);

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const defaultValues = useMemo(() => {
    if (dispatch) {
      return {
        srNo: dispatch.srNo || '',
        invDate: dispatch.invDate || todayIsoDate(),
        invoiceNo: dispatch.invoiceNo || '',
        saleOrderNo: dispatch.saleOrderNo || '',
        partyName: dispatch.partyName || '',
        partNo: dispatch.partNo || '',
        materialDescription: dispatch.materialDescription || '',
        quantity: dispatch.quantity !== undefined ? String(dispatch.quantity) : '',
        transport: dispatch.transport || '',
        vehicleNo: dispatch.vehicleNo || '',
        lrNo: dispatch.lrNo || '',
        lrDate: dispatch.lrDate || '',
        noOfBags: dispatch.noOfBags || '',
        dispatchStatus: dispatch.dispatchStatus || 'Dispatched',
        driverName: dispatch.driverName || '',
        driverPhone: dispatch.driverPhone || '',
        remarks: dispatch.remarks || '',
      };
    }

    return {
      srNo: getNextSrNo(dispatches),
      invDate: todayIsoDate(),
      invoiceNo: getNextInvoiceNo(dispatches),
      saleOrderNo: '',
      partyName: '',
      partNo: '',
      materialDescription: '',
      quantity: '',
      transport: 'TEMPO DELIVERY',
      vehicleNo: '',
      lrNo: '',
      lrDate: '',
      noOfBags: '',
      dispatchStatus: 'Dispatched',
      driverName: '',
      driverPhone: '',
      remarks: '',
    };
  }, [dispatch, dispatches]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(dispatchSchema),
    defaultValues,
  });

  const watchSaleOrderNo = watch('saleOrderNo');
  const watchInvoiceNo = watch('invoiceNo');

  // When a sale order is chosen or typed, auto-suggest details if matched
  const handleSaleOrderSelect = (selectedPoNo) => {
    setValue('saleOrderNo', selectedPoNo);
    const matchedOrder = orders.find(
      (o) => o.poNo === selectedPoNo || o.npplSaleNo === selectedPoNo
    );
    if (matchedOrder) {
      if (matchedOrder.partyName) setValue('partyName', matchedOrder.partyName);
      if (matchedOrder.partNo) setValue('partNo', matchedOrder.partNo);
      if (matchedOrder.productName) setValue('materialDescription', matchedOrder.productName);
      if (matchedOrder.orderQty && !watch('quantity')) {
        const remaining = (matchedOrder.orderQty || 0) - (matchedOrder.dispatchQty || 0);
        setValue('quantity', String(remaining > 0 ? remaining : matchedOrder.orderQty));
      }
    }
  };

  const onSubmit = async (data) => {
    if (isAdd) {
      await addDispatch(data);
    } else if (dispatch?.id) {
      await updateDispatch(dispatch.id, data);
    }
    onBack();
  };

  // Dropdown options
  const saleOrderOptions = useMemo(() => {
    const list = orders
      .map((o) => ({
        number: o.poNo || o.npplSaleNo,
        party: o.partyName,
        product: o.productName,
      }))
      .filter((o) => Boolean(o.number));
    return Array.from(new Map(list.map((item) => [item.number, item])).values());
  }, [orders]);

  const partyOptions = useMemo(() => {
    const fromMaster = parties.map((p) => p.partyName).filter(Boolean);
    const fromOrders = orders.map((o) => o.partyName).filter(Boolean);
    const fromDispatches = dispatches.map((d) => d.partyName).filter(Boolean);
    return Array.from(new Set([...fromMaster, ...fromOrders, ...fromDispatches]));
  }, [parties, orders, dispatches]);

  const transportOptions = useMemo(() => {
    const fromMaster = transporters.map((t) => t.transporterName).filter(Boolean);
    const fromDispatches = dispatches.map((d) => d.transport).filter(Boolean);
    const defaults = ['TEMPO DELIVERY', 'NANDWANA CARRIER', 'V-TRANS', 'BY HAND / SELF PICKUP'];
    return Array.from(new Set([...defaults, ...fromMaster, ...fromDispatches]));
  }, [transporters, dispatches]);

  return (
    <div className="animate-slide-up">
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              type="button"
              className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 flex items-center justify-center transition-all shadow-sm"
              title="Back to table"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-200 shadow-lg shadow-emerald-500/10">
              {isView ? (
                <Eye size={24} className="text-emerald-600" />
              ) : (
                <Truck size={24} className="text-emerald-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView
                  ? 'View Dispatch Details'
                  : isAdd
                  ? 'New Dispatch Consignment'
                  : 'Edit Dispatch Entry'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watchInvoiceNo
                  ? `Delivery Challan No.: ${watchInvoiceNo}`
                  : 'Enter consignment details for material dispatch'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
            >
              <X size={16} />
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button
                type="submit"
                form="dispatch-form"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                <Save size={16} />
                {isAdd ? 'Create Dispatch' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form id="dispatch-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-7">
            {/* Section 1: DELIVERY CHALLAN & ORDER INFORMATION */}
            <Section title="1. Delivery Challan & Order Information" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Field label="SR. NO" error={errors.srNo?.message}>
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('srNo')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-mono font-bold`}
                      placeholder="Auto"
                    />
                  </div>
                </Field>

                <Field label="Invoice Date" required error={errors.invDate?.message}>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      {...register('invDate')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-medium`}
                    />
                  </div>
                </Field>

                <Field label="Delivery Challan No." required error={errors.invoiceNo?.message}>
                  <div className="relative">
                    <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('invoiceNo')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-bold text-indigo-700 bg-indigo-50/30 border-indigo-200 uppercase`}
                      placeholder="NP/25-26/2071"
                    />
                  </div>
                </Field>

                <Field label="Sale Order No / PO No" required error={errors.saleOrderNo?.message}>
                  <div className="relative">
                    <ClipboardList size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      list="sale-orders-datalist"
                      {...register('saleOrderNo')}
                      disabled={isView}
                      onChange={(e) => handleSaleOrderSelect(e.target.value)}
                      className={`${inputCls} pl-11 font-mono font-semibold`}
                      placeholder="e.g. P20260034385"
                    />
                    <datalist id="sale-orders-datalist">
                      {saleOrderOptions.map((so) => (
                        <option key={so.number} value={so.number}>
                          {so.party ? `${so.party} - ${so.product || ''}` : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </Field>

                <Field label="Party / Customer Name" required error={errors.partyName?.message} colClass="md:col-span-2 xl:col-span-4">
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      list="party-datalist"
                      {...register('partyName')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-bold text-slate-800 uppercase`}
                      placeholder="Select or enter customer / party name"
                    />
                    <datalist id="party-datalist">
                      {partyOptions.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>
                </Field>
              </div>
            </Section>

            {/* Section 2: MATERIAL & QUANTITY DETAILS */}
            <Section title="2. Material & Consignment Quantity" icon={PackageSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Field label="Part No." error={errors.partNo?.message}>
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('partNo')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-mono font-semibold uppercase`}
                      placeholder="e.g. OS D4B4001209"
                    />
                  </div>
                </Field>

                <Field label="Material Description" required error={errors.materialDescription?.message} colClass="md:col-span-2 xl:col-span-3">
                  <div className="relative">
                    <PackageSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('materialDescription')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-semibold uppercase`}
                      placeholder="e.g. LABOUR CHARG.MOULD ELASTOMER 2T SQ"
                    />
                  </div>
                </Field>

                <Field label="Quantity" required error={errors.quantity?.message}>
                  <div className="relative">
                    <Scale size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="any"
                      {...register('quantity')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-extrabold text-emerald-600`}
                      placeholder="0"
                    />
                  </div>
                </Field>

                <Field label="No. of Bags / Packages" error={errors.noOfBags?.message}>
                  <div className="relative">
                    <Boxes size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('noOfBags')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-bold`}
                      placeholder="e.g. 5 Bags"
                    />
                  </div>
                </Field>

                <Field label="Dispatch Status" error={errors.dispatchStatus?.message} colClass="md:col-span-2 xl:col-span-2">
                  <select
                    {...register('dispatchStatus')}
                    disabled={isView}
                    className={selectCls}
                  >
                    {DISPATCH_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            {/* Section 3: LOGISTICS & TRANSPORTER */}
            <Section title="3. Logistics & Transport Consignment" icon={Truck}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Field label="Transporter / Carrier" required error={errors.transport?.message} colClass="md:col-span-2">
                  <div className="relative">
                    <Truck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      list="transport-datalist"
                      {...register('transport')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-semibold uppercase`}
                      placeholder="Select or enter transporter name"
                    />
                    <datalist id="transport-datalist">
                      {transportOptions.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                </Field>

                <Field label="Vehicle No." error={errors.vehicleNo?.message}>
                  <div className="relative">
                    <Car size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('vehicleNo')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-mono font-bold uppercase`}
                      placeholder="e.g. MH-04-AZ-1122"
                    />
                  </div>
                </Field>

                <Field label="LR. NO (Consignment No)" error={errors.lrNo?.message}>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('lrNo')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-mono font-bold`}
                      placeholder="e.g. LR-98765"
                    />
                  </div>
                </Field>

                <Field label="LR Date" error={errors.lrDate?.message}>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      {...register('lrDate')}
                      disabled={isView}
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Driver Name" error={errors.driverName?.message}>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('driverName')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-medium`}
                      placeholder="Driver full name"
                    />
                  </div>
                </Field>

                <Field label="Driver Contact No" error={errors.driverPhone?.message} colClass="md:col-span-2">
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('driverPhone')}
                      disabled={isView}
                      className={`${inputCls} pl-11 font-mono`}
                      placeholder="e.g. 9820011223"
                    />
                  </div>
                </Field>
              </div>
            </Section>

            {/* Section 4: REMARKS & NOTES */}
            <Section title="4. Remarks & Delivery Instructions" icon={ClipboardList}>
              <Field label="Consignment Remarks / Special Notes" error={errors.remarks?.message}>
                <textarea
                  {...register('remarks')}
                  disabled={isView}
                  rows={3}
                  className={`${baseInputClass} p-4 resize-y`}
                  placeholder="Enter any additional delivery instructions, packaging conditions, or invoice notes..."
                />
              </Field>
            </Section>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
            <div>
              {!isAdd && !isView && dispatch && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true, dispatch)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                  Delete Dispatch
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
              >
                <X size={16} />
                {isView ? 'Back to List' : 'Cancel'}
              </button>
              {!isView && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                >
                  <Save size={16} />
                  {isAdd ? 'Create Dispatch' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
