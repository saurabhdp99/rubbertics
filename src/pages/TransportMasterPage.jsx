import { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Edit,
  Eye,
  FileDown,
  Hash,
  MapPin,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { Table, Input, Select, Label, ListBox, DatePicker, DateField, Calendar } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StatsCard from '../components/common/StatsCard';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import { TRANSPORT_MASTER_FIELDS, TRANSPORT_MASTER_SECTIONS } from '../data/transportMasterTemplate';
import { useTransportMasterStore } from '../store/transportMasterStore';
import { useAuthStore } from '../store/authStore';


const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_TRANSPORTER = TRANSPORT_MASTER_FIELDS.reduce((transporter, field) => {
  if (field.type === 'select') transporter[field.key] = field.options?.[0] || '';
  else if (field.type === 'contacts') transporter[field.key] = [];
  else if (field.key === 'createdDate') transporter[field.key] = todayIsoDate();
  else transporter[field.key] = '';
  return transporter;
}, {});

const createInitialTransporterForm = (transporter, getNextTransporterCode) => {
  if (transporter) return { ...EMPTY_TRANSPORTER, ...transporter };

  return {
    ...EMPTY_TRANSPORTER,
    transporterCode: getNextTransporterCode(),
    createdBy: 'admin',
    createdDate: todayIsoDate(),
  };
};

const TABLE_COLUMNS = TRANSPORT_MASTER_FIELDS
  .filter(field => field.type !== 'contacts')
  .map(field => ({
    ...field,
    width: field.wide ? '260px' : field.type === 'date' ? '150px' : field.type === 'select' ? '170px' : '180px',
    align: ['transporterCode', 'status'].includes(field.key) ? 'center' : 'left',
  }));

const contactSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  mobileNo: z.string().optional(),
  location: z.string().optional()
});

const transportMasterSchema = z.object({
  transporterCode: z.string().min(1, 'Transporter code is required'),
  transporterName: z.string().min(1, 'Transporter name is required'),
  trasnporterAdd: z.string().optional(),
  location: z.string().optional(),
  gstNo: z.string().optional(),
  panNo: z.string().optional(),
  transporterType: z.string().optional(),
  transporterId: z.string().optional(),
  contactPerson: z.string().optional(),
  mobileNo: z.string().optional(),
  alternateMobileNo: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  defaultPaymentTerms: z.string().optional(),
  defaultFreightType: z.string().optional(),
  status: z.string().optional(),
  remarks: z.string().optional(),
  createdBy: z.string().optional(),
  createdDate: z.string().optional(),
  otherContacts: z.array(contactSchema).optional()
});

function ContactsField({ value, onChange, disabled }) {
  const handleAdd = () => {
    const newContact = { id: crypto.randomUUID(), name: '', mobileNo: '', location: '' };
    onChange([...(value || []), newContact]);
  };

  const handleRemove = (id) => {
    onChange((value || []).filter(c => c.id !== id));
  };

  const handleUpdate = (id, updates) => {
    onChange((value || []).map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {(!value || value.length === 0) ? 'Other Contact Persons' : `Other Contact Persons (${value.length})`}
        </Label>
        {!disabled && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Plus size={14} /> Add Contact
          </button>
        )}
      </div>

      {(!value || value.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <Users size={32} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">No other contacts added</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {value.map((contact) => (
            <div key={contact.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Contact Person Name"
                  value={contact.name}
                  onChange={(e) => handleUpdate(contact.id, { name: e.target.value })}
                  disabled={disabled}
                  className="w-full text-sm outline-none bg-slate-50 focus-within:bg-white transition-colors h-[42px] px-3 rounded-lg border border-slate-200 focus-within:border-emerald-500/50"
                  aria-label="Contact Person Name"
                />
                <Input
                  placeholder="Mobile No"
                  value={contact.mobileNo}
                  onChange={(e) => handleUpdate(contact.id, { mobileNo: e.target.value })}
                  disabled={disabled}
                  className="w-full text-sm outline-none bg-slate-50 focus-within:bg-white transition-colors h-[42px] px-3 rounded-lg border border-slate-200 focus-within:border-emerald-500/50"
                  aria-label="Mobile No"
                />
                <Input
                  placeholder="Location"
                  value={contact.location}
                  onChange={(e) => handleUpdate(contact.id, { location: e.target.value })}
                  disabled={disabled}
                  className="w-full text-sm outline-none bg-slate-50 focus-within:bg-white transition-colors h-[42px] px-3 rounded-lg border border-slate-200 focus-within:border-emerald-500/50"
                  aria-label="Location"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end md:self-auto">
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(contact.id)}
                    className="p-2 h-[42px] w-[42px] flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({
  field,
  control,
  disabled,
  error,
  options,
  onAddOption,
  onRenameOption,
  onDeleteOption,
}) {
  if (field.type === 'contacts') {
    return (
      <div className="col-span-1 md:col-span-2 xl:col-span-3">
        <Controller
          control={control}
          name={field.key}
          render={({ field: { value, onChange } }) => (
            <ContactsField value={value} onChange={onChange} disabled={disabled} />
          )}
        />
      </div>
    );
  }

  const baseInputClass = `w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none ${error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-emerald-500/50'
    } input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`;
  const inputClass = `${baseInputClass} px-4 py-3`;
  const isLocked = disabled || field.autoGenerated;

  return (
    <label className={`flex flex-col gap-2 ${field.wide ? 'md:col-span-2 xl:col-span-3' : ''}`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <Controller
        control={control}
        name={field.key}
        render={({ field: { onChange, value, onBlur, ref } }) => {
          if (field.type === 'select') {
            return (
              <EditableCreatableSelect
                value={value || options?.[0] || ''}
                options={options || field.options || []}
                disabled={disabled}
                placeholder={field.label}
                onChange={onChange}
                onAdd={onAddOption}
                onRename={onRenameOption}
                onDelete={onDeleteOption}
              />
            );
          }
          if (field.type === 'textarea') {
            return (
              <textarea
                value={value ?? ''}
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                className={`${inputClass} min-h-28 resize-y`}
                placeholder={field.label}
                ref={ref}
              />
            );
          }
          if (field.type === 'date') {
            return (
              <DatePicker
                value={value ? parseDate(value) : null}
                isDisabled={isLocked}
                onChange={(dateVal) => onChange(dateVal ? dateVal.toString() : '')}
                className="w-full"
                aria-label={field.label}
              >
                <DateField.Group className={`${baseInputClass} flex items-center overflow-hidden h-[46px]`} fullWidth>
                  <DateField.Input className="flex-1 py-3 px-4 outline-none bg-transparent">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix className="pr-4">
                    <DatePicker.Trigger className="text-slate-500 hover:text-emerald-600 transition-colors">
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover>
                  <Calendar aria-label={field.label}>
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                      <Calendar.YearPickerGridBody>
                        {({ year }) => <Calendar.YearPickerCell year={year} />}
                      </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>
            );
          }
          return (
            <Input
              type={field.type || 'text'}
              step={field.type === 'number' ? '0.01' : undefined}
              value={value ?? ''}
              disabled={isLocked}
              onChange={onChange}
              onBlur={onBlur}
              className={inputClass}
              placeholder={field.autoGenerated ? 'Auto generated on create' : field.label}
              aria-label={field.label}
              ref={ref}
            />
          );
        }}
      />
      {field.autoGenerated && !disabled && (
        <span className="text-[11px] font-semibold text-emerald-600">Auto generated and locked</span>
      )}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}

function TransportMasterForm({ mode, transporter, onBack }) {
  const {
    addTransporter: addTransporterMaster,
    updateTransporter: updateTransporterMaster,
    getNextTransporterCode,
    lookups: transportMasterLookups,
    addLookupOption: addTransportMasterLookupOption,
    renameLookupOption: renameTransportMasterLookupOption,
    deleteLookupOption: deleteTransportMasterLookupOption,
  } = useTransportMasterStore();
  const { currentOrg, currentUser } = useAuthStore();

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const { control, handleSubmit: hookFormSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(transportMasterSchema),
    defaultValues: createInitialTransporterForm(transporter, getNextTransporterCode)
  });

  useEffect(() => {
    reset(createInitialTransporterForm(transporter, getNextTransporterCode));
  }, [transporter, mode, reset, getNextTransporterCode]);

  const groupedFields = TRANSPORT_MASTER_SECTIONS.map(section => ({
    section,
    fields: TRANSPORT_MASTER_FIELDS.filter(field => field.section === section),
  }));

  const onSubmit = async (data) => {
    if (isAdd) await addTransporterMaster(data, currentOrg?.id, currentUser?.id);
    else await updateTransporterMaster(transporter.id, data, currentUser?.id);
    onBack();
  };


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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Truck size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Transport Master' : isAdd ? 'Add Transport Master' : 'Edit Transport Master'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watch('transporterCode') || 'Transporter code will be generated automatically'}
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
                form="transport-master-page-form"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Transporter' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="transport-master-page-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-7">
            {groupedFields.map(group => (
              <section key={group.section} className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Tag size={15} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{group.section}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {group.fields.map(field => (
                    <FormField
                      key={field.key}
                      field={field}
                      control={control}
                      disabled={isView || isSubmitting}
                      error={errors[field.key]?.message}
                      options={transportMasterLookups[field.key] || field.options}
                      onAddOption={(value) => addTransportMasterLookupOption(field.key, value)}
                      onRenameOption={(oldValue, newValue) => renameTransportMasterLookupOption(field.key, oldValue, newValue)}
                      onDeleteOption={(value) => deleteTransportMasterLookupOption(field.key, value)}
                    />
                  ))}
                </div>
              </section>
            ))}
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
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                {isAdd ? 'Create Transporter' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function TransportMasterPage() {
  const {
    transporters: transporterMasterItems,
    searchQuery: transporterMasterSearchQuery,
    typeFilter: transporterMasterTypeFilter,
    statusFilter: transporterMasterStatusFilter,
    currentPage: transporterMasterCurrentPage,
    itemsPerPage: transporterMasterItemsPerPage,
    setSearchQuery: setTransporterMasterSearchQuery,
    setTypeFilter: setTransporterMasterTypeFilter,
    setStatusFilter: setTransporterMasterStatusFilter,
    setCurrentPage: setTransporterMasterCurrentPage,
    setItemsPerPage: setTransporterMasterItemsPerPage,
    deleteTransporter: deleteTransporterMaster,
    getFilteredTransporters: getFilteredTransporterMasterItems,
    getStats: getTransporterMasterStats,
    fetchTransporters, isLoading,
  } = useTransportMasterStore();
  const { currentOrg } = useAuthStore();

  useEffect(() => {
    if (currentOrg?.id) fetchTransporters(currentOrg.id);
  }, [currentOrg?.id]);

  const [viewState, setViewState] = useState({ type: 'table', mode: null, transporter: null });
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);

  const filtered = getFilteredTransporterMasterItems();
  const stats = getTransporterMasterStats();
  const totalPages = Math.ceil(filtered.length / transporterMasterItemsPerPage);
  const pagedTransporters = filtered.slice(
    (transporterMasterCurrentPage - 1) * transporterMasterItemsPerPage,
    transporterMasterCurrentPage * transporterMasterItemsPerPage
  );

  const transporterTypes = useMemo(() => {
    return ['All', ...Array.from(new Set(transporterMasterItems.map(item => item.transporterType).filter(Boolean))).sort()];
  }, [transporterMasterItems]);

  const statusTypes = useMemo(() => {
    return ['All', ...Array.from(new Set(transporterMasterItems.map(item => item.status).filter(Boolean))).sort()];
  }, [transporterMasterItems]);

  const openForm = (mode, transporter = null) => {
    setDeleteCandidateId(null);
    setViewState({ type: 'form', mode, transporter });
  };

  const backToTable = () => setViewState({ type: 'table', mode: null, transporter: null });

  const clearFilters = () => {
    setTransporterMasterSearchQuery('');
    setTransporterMasterTypeFilter('All');
    setTransporterMasterStatusFilter('All');
  };

  const exportCsv = () => {
    const headers = TRANSPORT_MASTER_FIELDS.map(field => field.label);
    const rows = filtered.map(transporter => TRANSPORT_MASTER_FIELDS.map(field => String(transporter[field.key] ?? '').replaceAll('"', '""')));
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transport-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (transporter, column) => {
    const value = transporter[column.key];

    if (column.key === 'transporterCode') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }

    if (column.key === 'transporterName') {
      return <span className="font-bold text-slate-800 line-clamp-2" title={value}>{value || '-'}</span>;
    }

    if (column.key === 'status') {
      const isActive = value === 'Active';
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
          {value || '-'}
        </span>
      );
    }

    if (column.key === 'email') {
      return value ? (
        <span className="inline-flex items-center gap-1.5 max-w-[220px] truncate text-indigo-700" title={value}>
          <Mail size={12} /> {value}
        </span>
      ) : '-';
    }

    if (column.key === 'mobileNo') {
      return value ? (
        <span className="inline-flex items-center gap-1.5 text-slate-700 whitespace-nowrap" title={value}>
          <Phone size={12} /> {value}
        </span>
      ) : '-';
    }

    if (column.type === 'number') {
      const numericValue = value === '' || value === null || value === undefined ? null : Number(value);
      return <span className="font-semibold text-slate-800">{numericValue === null || Number.isNaN(numericValue) ? '-' : numericValue.toFixed(2)}</span>;
    }

    if (column.type === 'select') {
      return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-100 text-slate-600 border-slate-200">
          {value || '-'}
        </span>
      );
    }

    return <span className="block max-w-[220px] truncate" title={value}>{value || '-'}</span>;
  };

  return (
    <div className="p-3 max-w-[1920px] mx-auto animate-slide-up">
      {viewState.type !== 'form' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Total Transporters" value={stats.total.toLocaleString()} icon={Truck} color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.25)" animationDelay={0} />
          <StatsCard label="Active Transporters" value={stats.active.toLocaleString()} icon={BadgeCheck} color="#6366f1" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.25)" animationDelay={50} />
          <StatsCard label="Inactive / Hold" value={stats.inactiveOrHold.toLocaleString()} icon={SlidersHorizontal} color="#f59e0b" bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.25)" animationDelay={100} />
          <StatsCard label="Blacklisted" value={stats.blacklisted.toLocaleString()} icon={X} color="#ef4444" bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.25)" animationDelay={150} />
        </div>
      )}

      {viewState.type === 'form' ? (
        <TransportMasterForm
          key={`${viewState.mode}-${viewState.transporter?.id || 'new'}`}
          mode={viewState.mode}
          transporter={viewState.transporter}
          onBack={backToTable}
        />
      ) : (
        <>
          <div className="glass-card rounded-2xl p-5 shadow-xl mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full min-w-0 group">

                <Input
                  type="text"
                  placeholder="Search by transporter code, transporter name, GST, PAN, contact..."
                  value={transporterMasterSearchQuery}
                  onChange={event => setTransporterMasterSearchQuery(event.target.value)}
                  aria-label="Search transporters"
                  className="w-full pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-emerald-500/50 bg-white border border-slate-200"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <Select
                  value={transporterMasterTypeFilter}
                  onChange={(val) => setTransporterMasterTypeFilter(val)}
                  className="w-[180px]"
                  aria-label="Transport Type Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {transporterTypes.map(type => (
                        <ListBox.Item key={type} id={type} textValue={type === 'All' ? 'All Transport Types' : type}>
                          {type === 'All' ? 'All Transport Types' : type}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select
                  value={transporterMasterStatusFilter}
                  onChange={(val) => setTransporterMasterStatusFilter(val)}
                  className="w-[140px]"
                  aria-label="Status Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {statusTypes.map(status => (
                        <ListBox.Item key={status} id={status} textValue={status === 'All' ? 'All Status' : status}>
                          {status === 'All' ? 'All Status' : status}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
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
                  Add Transporter
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{transporterMasterItems.length}</span> transporters
              </p>
              {(transporterMasterSearchQuery || transporterMasterTypeFilter !== 'All' || transporterMasterStatusFilter !== 'All') && (
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
                  aria-label="Transport master table"
                  className="text-left"
                  style={{ minWidth: `${TABLE_COLUMNS.length * 170 + 150}px` }}
                >
                  <Table.Header>
                    <Table.Column isRowHeader className="w-28 whitespace-nowrap">
                      Actions
                    </Table.Column>
                    {TABLE_COLUMNS.map(column => (
                      <Table.Column
                        key={column.key}
                        className="whitespace-nowrap"
                        style={{ minWidth: column.width, textAlign: column.align || 'left' }}
                      >
                        {column.label}
                      </Table.Column>
                    ))}
                  </Table.Header>
                  <Table.Body items={pagedTransporters} renderEmptyState={() => (
                    <div className="py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                          <SlidersHorizontal size={32} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">No transporters found. Try adjusting your filters.</p>
                      </div>
                    </div>
                  )}>
                    {(transporter) => (
                      <Table.Row key={transporter.id} className="group">
                        <Table.Cell>
                          {deleteCandidateId === transporter.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  deleteTransporterMaster(transporter.id);
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
                              <button onClick={() => openForm('view', transporter)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all" title="View">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => openForm('edit', transporter)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all" title="Edit">
                                <Edit size={15} />
                              </button>
                              <button onClick={() => setDeleteCandidateId(transporter.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </Table.Cell>
                        {TABLE_COLUMNS.map(column => (
                          <Table.Cell key={column.key} className="text-[13px] text-slate-700" style={{ textAlign: column.align || 'left' }}>
                            {renderCellValue(transporter, column)}
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
                  value={transporterMasterItemsPerPage.toString()}
                  onChange={(val) => setTransporterMasterItemsPerPage(Number(val))}
                  className="w-[80px]"
                  aria-label="Rows per page"
                >
                  <Select.Trigger className="px-3 py-1.5 h-auto min-h-[34px] rounded-lg text-slate-700 bg-white border border-slate-200 outline-none hover:bg-slate-50 transition-colors">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {[10, 20, 50, 100].map(count => (
                        <ListBox.Item key={count.toString()} id={count.toString()} textValue={count.toString()}>
                          {count}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTransporterMasterCurrentPage(Math.max(1, transporterMasterCurrentPage - 1))}
                  disabled={transporterMasterCurrentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: Math.min(5, totalPages || 1) }, (_, index) => {
                    let page;
                    if (totalPages <= 5) page = index + 1;
                    else if (transporterMasterCurrentPage <= 3) page = index + 1;
                    else if (transporterMasterCurrentPage >= totalPages - 2) page = totalPages - 4 + index;
                    else page = transporterMasterCurrentPage - 2 + index;

                    return (
                      <button
                        key={page}
                        onClick={() => setTransporterMasterCurrentPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${transporterMasterCurrentPage === page
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
                  onClick={() => setTransporterMasterCurrentPage(Math.min(totalPages, transporterMasterCurrentPage + 1))}
                  disabled={transporterMasterCurrentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{transporterMasterCurrentPage}</span> of{' '}
                <span className="text-slate-800">{totalPages || 1}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
