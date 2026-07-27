import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Calendar,
  Building2,
  PackageSearch,
  Hash,
  Truck,
  CheckCircle2,
  UserCheck,
  FileText,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  SlidersHorizontal,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Input, Select, ListBox, DatePicker, DateField, Calendar as HeroCalendar, Spinner } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StatsCard from '../components/common/StatsCard';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';
import { useInwardStore } from '../store/inwardStore';
import { useAuthStore } from '../store/authStore';

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_ENTRY = {
  date: todayIsoDate(),
  grn_no: '',
  party_name: '',
  description: '',
  quantity: '',
  uom: 'KG',
  invoice_date: '',
  invoice_no: '',
  transporter: '',
  tc_received: 'NO',
  qty_verified_by: '',
  po_no: '',
  received_by: ''
};

const inwardSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  grn_no: z.string().min(1, 'GRN No is required'),
  party_name: z.string().min(1, 'Party name is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  uom: z.string().min(1, 'UOM is required'),
  invoice_date: z.string().optional(),
  invoice_no: z.string().optional(),
  transporter: z.string().optional(),
  tc_received: z.string().optional(),
  qty_verified_by: z.string().optional(),
  po_no: z.string().optional(),
  received_by: z.string().optional()
});

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

function InwardForm({ mode, entry, onBack }) {
  const { addEntry, updateEntry } = useInwardStore();
  const { currentOrg, currentUser } = useAuthStore();
  
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(inwardSchema),
    defaultValues: entry || EMPTY_ENTRY
  });

  useEffect(() => {
    reset(entry || EMPTY_ENTRY);
  }, [entry, reset]);

  const onSubmit = async (data) => {
    if (isAdd) {
      await addEntry(data, currentOrg?.id, currentUser?.id);
    } else {
      await updateEntry(entry.id, data);
    }
    onBack();
  };

  const inputCls = "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-indigo-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

  return (
    <div className="animate-slide-up">
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 flex items-center justify-center transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-200 shadow-lg shadow-indigo-500/10">
              {isView ? <Eye size={24} className="text-indigo-600" /> : <FileText size={24} className="text-indigo-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View GRN Entry' : isAdd ? 'New GRN Entry' : 'Edit GRN Entry'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Fill the details below
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
                form="grn-form"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                {isAdd ? 'Create Entry' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="grn-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Date Field */}
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <Field label="Date" required error={errors.date?.message}>
                  <DatePicker
                    value={value ? parseDate(value) : null}
                    isDisabled={isView}
                    onChange={(v) => onChange(v ? v.toString() : '')}
                    className="w-full"
                    aria-label="Date"
                  >
                    <DateField.Group className={`${inputCls} flex items-center overflow-hidden h-[46px] !pr-2 !py-0`} fullWidth>
                      <DateField.Input className="flex-1 px-4 py-3 outline-none bg-transparent">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix className="pr-2">
                        <DatePicker.Trigger className="text-slate-500 hover:text-indigo-600 transition-colors">
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover>
                      <HeroCalendar aria-label="Date Calendar">
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
                            {({ year }) => <HeroCalendar.YearPickerCell year={year} />}
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
              name="grn_no"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="GRN NO" required error={errors.grn_no?.message}>
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Enter GRN No" className={`${inputCls} px-4 py-3`} aria-label="GRN No" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="party_name"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Party Name" required error={errors.party_name?.message}>
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Enter Party Name" className={`${inputCls} px-4 py-3`} aria-label="Party Name" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Description of Goods" required error={errors.description?.message} wide>
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Enter Description" className={`${inputCls} px-4 py-3`} aria-label="Description" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Quantity" required error={errors.quantity?.message}>
                  <Input type="number" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="0" className={`${inputCls} px-4 py-3`} aria-label="Quantity" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="uom"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="UOM" required error={errors.uom?.message}>
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="KG / LTR" className={`${inputCls} px-4 py-3`} aria-label="UOM" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="invoice_date"
              render={({ field: { onChange, value } }) => (
                <Field label="Invoice Date">
                  <DatePicker
                    value={value ? parseDate(value) : null}
                    isDisabled={isView}
                    onChange={(v) => onChange(v ? v.toString() : '')}
                    className="w-full"
                    aria-label="Invoice Date"
                  >
                    <DateField.Group className={`${inputCls} flex items-center overflow-hidden h-[46px] !pr-2 !py-0`} fullWidth>
                      <DateField.Input className="flex-1 px-4 py-3 outline-none bg-transparent">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix className="pr-2">
                        <DatePicker.Trigger className="text-slate-500 hover:text-indigo-600 transition-colors">
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover>
                      <HeroCalendar aria-label="Invoice Date Calendar">
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
                            {({ year }) => <HeroCalendar.YearPickerCell year={year} />}
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
              name="invoice_no"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Invoice No">
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Enter Invoice No" className={`${inputCls} px-4 py-3`} aria-label="Invoice No" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="transporter"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Transporter/LR">
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Enter Transporter" className={`${inputCls} px-4 py-3`} aria-label="Transporter" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="tc_received"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="T.C. Received">
                  <select disabled={isView} value={value || 'NO'} onChange={onChange} ref={ref} className={`${inputCls} px-4 py-3 cursor-pointer`} aria-label="TC Received">
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="qty_verified_by"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Qty Verified By">
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Name" className={`${inputCls} px-4 py-3`} aria-label="Qty Verified By" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="po_no"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="PO. NO">
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="PO Number" className={`${inputCls} px-4 py-3`} aria-label="PO No" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="received_by"
              render={({ field: { onChange, value, ref } }) => (
                <Field label="Received By">
                  <Input type="text" value={value || ''} disabled={isView} onChange={onChange} ref={ref} placeholder="Name" className={`${inputCls} px-4 py-3`} aria-label="Received By" />
                </Field>
              )}
            />

          </div>
        </form>
      </div>
    </div>
  );
}

export default function InwardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentOrg } = useAuthStore();
  const {
    entries, isLoading, fetchEntries,
    isModalOpen, modalMode, selectedEntry,
    setModalOpen, setModalMode, setSelectedEntry,
    isDeleteConfirmOpen, entryToDelete, setDeleteConfirmOpen, setEntryToDelete,
    deleteEntry
  } = useInwardStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchEntries(currentOrg.id);
    }
  }, [currentOrg]);

  const handleAdd = () => {
    setSelectedEntry(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntry(entryToDelete.id);
      closeDeleteConfirm();
    }
  };

  const filteredEntries = entries.filter(e => {
    const search = searchTerm.toLowerCase();
    return (
      (e.grn_no || '').toLowerCase().includes(search) ||
      (e.party_name || '').toLowerCase().includes(search) ||
      (e.description || '').toLowerCase().includes(search)
    );
  });

  const totalQuantity = filteredEntries.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  const columns = [
    {
      header: 'Date', accessor: 'date', icon: Calendar, width: 'w-[110px]', render: (value) => (
        <span className="font-mono text-[12px] text-slate-500">{value}</span>
      )
    },
    {
      header: 'GRN NO', accessor: 'grn_no', icon: Hash, width: 'w-[110px]', render: (value) => (
        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span>
      )
    },
    {
      header: 'Party Name', accessor: 'party_name', icon: Building2, width: 'w-[200px]', render: (value) => (
        <span className="font-bold text-slate-800">{value}</span>
      )
    },
    {
      header: 'Description of Goods', accessor: 'description', icon: PackageSearch, width: 'w-[220px]', render: (value) => (
        <span className="font-semibold text-slate-700 uppercase tracking-tight">{value}</span>
      )
    },
    {
      header: 'Quantity', accessor: 'quantity', width: 'w-[120px]', align: 'right', render: (value) => (
        <span className="font-extrabold text-indigo-600">{value}</span>
      )
    },
    {
      header: 'UOM', accessor: 'uom', width: 'w-[80px]', align: 'center', render: (value) => (
        <span className="text-slate-500 font-bold text-[11px]">{value}</span>
      )
    },
    {
      header: 'Inv Date', accessor: 'invoice_date', icon: Calendar, width: 'w-[120px]', render: (value) => (
        <span className="font-mono text-[12px] text-slate-500">{value}</span>
      )
    },
    {
      header: 'Invoice No', accessor: 'invoice_no', icon: FileText, width: 'w-[120px]', render: (value) => (
        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">{value}</span>
      )
    },
    {
      header: 'Transporter/LR', accessor: 'transporter', icon: Truck, width: 'w-[180px]', render: (value) => (
        <span className="font-medium text-slate-600">{value}</span>
      )
    },
    {
      header: 'T.C Recv', accessor: 'tc_received', width: 'w-[100px]', align: 'center', render: (value) => (
        value === 'YES' ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={14} />
          </span>
        ) : (
          <span className="text-slate-400 font-bold text-xs">NO</span>
        )
      )
    },
    {
      header: 'Qty Verified', accessor: 'qty_verified_by', icon: UserCheck, width: 'w-[140px]', render: (value) => (
        <span className="font-medium text-slate-700">{value}</span>
      )
    },
    {
      header: 'PO.NO', accessor: 'po_no', width: 'w-[160px]', render: (value) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">{value}</span>
      )
    },
    {
      header: 'Received By', accessor: 'received_by', icon: User, width: 'w-[140px]', render: (value) => (
        <span className="font-bold text-slate-700">{value}</span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: 'w-[140px]',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }
  ];

  if (isModalOpen) {
    return <InwardForm mode={modalMode} entry={selectedEntry} onBack={() => setModalOpen(false)} />;
  }

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up py-8 px-3 relative">
      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total GRNs Today"
          value={entries.filter(e => e.date === todayIsoDate()).length.toString()}
          icon={FileText}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label="Total Quantity Received"
          value={`${totalQuantity}`}
          icon={PackageSearch}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label="Pending Verifications"
          value={entries.filter(e => !e.qty_verified_by).length.toString()}
          icon={CheckCircle2}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label="Active Transporters"
          value={new Set(entries.map(e => e.transporter).filter(Boolean)).size.toString()}
          icon={Truck}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.12)"
          border="rgba(139,92,246,0.25)"
          animationDelay={150}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by GRN No, Party Name, Material..."
          theme="indigo"
          showFilter={true}
          addButtonText="New GRN"
          onAdd={handleAdd}
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredEntries}
          minWidth="1800px"
          isLoading={isLoading}
        />
        <TableFooter
          totalEntries={filteredEntries.length}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && entryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Delete GRN Entry?</h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed">
                Are you sure you want to delete GRN <span className="font-bold text-slate-700">{entryToDelete.grn_no}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
