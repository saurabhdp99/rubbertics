import { useMemo, useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Eye,
  FileDown,
  FileText,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  UploadCloud,
  X,
  ClipboardList
} from 'lucide-react';
import { Table, Input, Select, Label, DatePicker, DateField, Calendar, Spinner } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StatsCard from '../components/common/StatsCard';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import { ENQUIRY_FIELDS, ENQUIRY_SECTIONS } from '../data/enquiryTemplate';
import { useEnquiryStore } from '../store/enquiryStore';
import { useAuthStore } from '../store/authStore';


const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_ENQUIRY = ENQUIRY_FIELDS.reduce((enq, field) => {
  if (field.type === 'select') enq[field.key] = field.options?.[0] || '';
  else if (field.type === 'creatable-select') enq[field.key] = '';
  else if (field.type === 'attachments') enq[field.key] = [];
  else if (field.key === 'systemDate') enq[field.key] = todayIsoDate();
  else enq[field.key] = '';
  return enq;
}, {});

const createInitialEnquiryForm = (enquiry) => {
  if (enquiry) return { ...EMPTY_ENQUIRY, ...enquiry };
  return {
    ...EMPTY_ENQUIRY,
    enquiryNo: 'Auto generated on create',
    systemDate: todayIsoDate(),
  };
};

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  dataUrl: z.string(),
  type: z.string(),
  size: z.number(),
});

const enquirySchema = z.object({
  enquiryNo: z.string().optional(),
  systemDate: z.string().optional(),
  enquirySource: z.string().optional(),
  priority: z.string().optional(),
  salesPerson: z.string().optional(),
  companyName: z.string().optional(),
  personName: z.string().optional(),
  designation: z.string().optional(),
  mobileNo: z.string().optional(),
  emailId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  state: z.string().optional(),
  productName: z.string().optional(),
  itemQuantity: z.coerce.number().optional().or(z.literal('')),
  dueDate: z.string().optional(),
  specification: z.string().optional(),
  remark: z.string().optional(),
  enquiryAttachments: z.array(attachmentSchema).optional(),
}).superRefine((data, ctx) => {
  if (!data.companyName?.trim() && !data.personName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company Name or Person Name is required",
      path: ["companyName"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company Name or Person Name is required",
      path: ["personName"],
    });
  }
});

const TABLE_COLUMNS = ENQUIRY_FIELDS
  .filter(field => !['enquiryAttachments', 'specification', 'remark', 'address'].includes(field.key))
  .map(field => ({
    ...field,
    width: field.wide ? '260px' : field.type === 'date' ? '150px' : field.type === 'select' || field.type === 'creatable-select' ? '170px' : '180px',
    align: ['enquiryNo', 'priority'].includes(field.key) ? 'center' : 'left',
  }));

function AttachmentsField({ value = [], onChange, disabled, fieldKey }) {
  const fileInputRef = useRef(null);

  const handleAddClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              dataUrl: e.target.result,
              type: file.type,
              size: file.size,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    ).then((newAttachments) => {
      onChange(fieldKey, [...(value || []), ...newAttachments]);
    });

    e.target.value = '';
  };

  const handleRemove = (id) => {
    onChange(fieldKey, (value || []).filter(a => a.id !== id));
  };

  const handleRename = (id, newName) => {
    onChange(fieldKey, (value || []).map(a => a.id === id ? { ...a, name: newName } : a));
  };

  const handleView = (attachment) => {
    const newTab = window.open();
    if (newTab) {
      if (attachment.type === 'application/pdf') {
        newTab.document.write(`<iframe width="100%" height="100%" src="${attachment.dataUrl}"></iframe>`);
      } else if (attachment.type.startsWith('image/')) {
        newTab.document.write(`<img src="${attachment.dataUrl}" style="max-width: 100%;" />`);
      } else {
        newTab.document.write(`
          <div style="padding: 20px; font-family: sans-serif;">
            <h2>Cannot preview this file type natively in browser</h2>
            <p>Type: ${attachment.type}</p>
            <a href="${attachment.dataUrl}" download="${attachment.name}" style="padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 5px;">Download File</a>
          </div>
        `);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={disabled}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      />

      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {(!value || value.length === 0) ? 'Documents' : `Documents (${value.length})`}
        </Label>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <UploadCloud size={14} /> Upload Files
          </button>
        )}
      </div>

      {(!value || value.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <FileText size={32} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">No documents attached</p>
          {!disabled && <p className="text-xs mt-1">Click "Upload Files" to add PDFs, Word, Excel, or Images</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {value.map((attachment) => (
            <div key={attachment.id} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={attachment.name}
                    onChange={(e) => handleRename(attachment.id, e.target.value)}
                    disabled={disabled}
                    className="w-full text-sm font-medium text-slate-700 bg-transparent border-none p-0 focus:ring-0 h-6 truncate"
                    title={attachment.name}
                  />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                    {(attachment.size / 1024).toFixed(1)} KB • {attachment.type.split('/')[1] || 'FILE'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleView(attachment)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <Eye size={14} /> View
                </button>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(attachment.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} />
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
  if (field.type === 'attachments') {
    return (
      <div className="col-span-1 md:col-span-2 xl:col-span-3">
        <Controller
          control={control}
          name={field.key}
          render={({ field: { value, onChange } }) => (
            <AttachmentsField value={value} onChange={(key, val) => onChange(val)} disabled={disabled} fieldKey={field.key} />
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
    <Controller
      control={control}
      name={field.key}
      render={({ field: { onChange, value, onBlur, ref } }) => (
        <label className={`flex flex-col gap-1.5 ${field.wide ? 'col-span-1 md:col-span-2 xl:col-span-3' : ''}`}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
            {field.label}
            {field.required && <span className="text-red-400">*</span>}
          </span>
          {field.type === 'creatable-select' ? (
            <EditableCreatableSelect
              value={value}
              onChange={onChange}
              options={options || []}
              onAdd={onAddOption}
              onRename={onRenameOption}
              onDelete={onDeleteOption}
              placeholder={`Select or create ${field.label}`}
              disabled={isLocked}
            />
          ) : field.type === 'select' ? (
            <select
              value={value || ''}
              disabled={isLocked}
              onChange={onChange}
              onBlur={onBlur}
              className={`${inputClass} appearance-none cursor-pointer`}
              aria-label={field.label}
              ref={ref}
            >
              <option value="" disabled>Select {field.label}</option>
              {(options || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={value ?? ''}
              disabled={isLocked}
              onChange={onChange}
              onBlur={onBlur}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder={field.label}
              ref={ref}
            />
          ) : field.type === 'date' ? (
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
                    <div className="flex items-center gap-1">
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </div>
                  </Calendar.Header>
                  <Calendar.Grid>
                    <Calendar.GridHeader>
                      {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                    </Calendar.GridHeader>
                    <Calendar.GridBody>
                      {(date) => <Calendar.Cell date={date} />}
                    </Calendar.GridBody>
                  </Calendar.Grid>
                  <Calendar.YearPickerGrid>
                    <Calendar.YearPickerGridBody>
                      {({year}) => <Calendar.YearPickerCell year={year} />}
                    </Calendar.YearPickerGridBody>
                  </Calendar.YearPickerGrid>
                </Calendar>
              </DatePicker.Popover>
            </DatePicker>
          ) : (
            <Input
              type={field.type || 'text'}
              value={value ?? ''}
              disabled={isLocked}
              onChange={onChange}
              onBlur={onBlur}
              className={inputClass}
              placeholder={field.autoGenerated ? 'Auto generated on create' : field.label}
              aria-label={field.label}
              ref={ref}
            />
          )}
          {field.autoGenerated && !disabled && (
            <span className="text-[11px] font-semibold text-emerald-600">Auto generated and locked</span>
          )}
          {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        </label>
      )}
    />
  );
}

function EnquiryForm({ mode, enquiry, onBack }) {
  const {
    enquiries: enquiryItems,
    addEnquiry,
    updateEnquiry,
    lookups: enquiryLookups,
    addLookupOption: addEnquiryLookupOption,
    renameLookupOption: renameEnquiryLookupOption,
    deleteLookupOption: deleteEnquiryLookupOption,
  } = useEnquiryStore();
  const { currentOrg, currentUser } = useAuthStore();

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const { control, handleSubmit: hookFormSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: createInitialEnquiryForm(enquiry)
  });

  useEffect(() => {
    reset(createInitialEnquiryForm(enquiry));
  }, [enquiry, mode, reset]);

  const groupedFields = ENQUIRY_SECTIONS.map(section => ({
    section,
    fields: ENQUIRY_FIELDS.filter(field => field.section === section),
  }));

  const onSubmit = async (data) => {
    const finalForm = { ...data };
    if (isAdd) {
      // Auto generate enquiry code based on year and existing items
      const year = new Date().getFullYear();
      // Count how many enquiries from this year
      const enquiriesThisYear = enquiryItems.filter(e => e.enquiryNo?.startsWith(`${year}/`));
      const nextSequence = enquiriesThisYear.length + 1;
      finalForm.enquiryNo = `${year}/${String(nextSequence).padStart(4, '0')}`;
      await addEnquiry(finalForm, currentOrg?.id, currentUser?.id);
    } else {
      await updateEnquiry(enquiry.id, finalForm, currentUser?.id);
    }

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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <ClipboardList size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Enquiry' : isAdd ? 'Add Enquiry' : 'Edit Enquiry'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {isAdd ? 'Enquiry No will be generated automatically' : watch('enquiryNo')}
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
                form="enquiry-page-form"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Enquiry' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="enquiry-page-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
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
                      options={enquiryLookups[field.key] || field.options}
                      onAddOption={(newOption) => addEnquiryLookupOption(field.key, newOption)}
                      onRenameOption={(oldOption, newOption) => renameEnquiryLookupOption(field.key, oldOption, newOption)}
                      onDeleteOption={(option) => deleteEnquiryLookupOption(field.key, option)}
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                {isSubmitting ? <SlidersHorizontal size={16} className="spin" /> : <Save size={16} />}
                {isAdd ? 'Create Enquiry' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function EnquiryRegisterPage() {
  const {
    enquiries: enquiryItems,
    searchQuery: enquirySearchQuery,
    setSearchQuery: setEnquirySearchQuery,
    deleteEnquiry,
    fetchEnquiries, isLoading,
  } = useEnquiryStore();
  const { currentOrg } = useAuthStore();

  useEffect(() => {
    if (currentOrg?.id) fetchEnquiries(currentOrg.id);
  }, [currentOrg?.id]);


  const [activeForm, setActiveForm] = useState(null); // null, { mode: 'add' }, { mode: 'edit', enquiry }, { mode: 'view', enquiry }
  const [localSearch, setLocalSearch] = useState(enquirySearchQuery);

  // Derived state
  const totalEnquiries = enquiryItems.length;
  const highPriority = enquiryItems.filter(i => i.priority === 'High').length;
  const newEnquiries = enquiryItems.filter(i => {
    const today = new Date();
    const enqDate = new Date(i.systemDate);
    // Simple check: within last 7 days
    return (today - enqDate) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const filteredItems = useMemo(() => {
    return enquiryItems.filter(item => {
      const q = localSearch.toLowerCase();
      if (q && !Object.values(item).some(val => String(val).toLowerCase().includes(q))) {
        return false;
      }
      return true;
    });
  }, [enquiryItems, localSearch]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this enquiry?')) {
      deleteEnquiry(id);
    }
  };

  if (activeForm) {
    return (
      <div className="p-3 max-w-7xl mx-auto">
        <EnquiryForm
          mode={activeForm.mode}
          enquiry={activeForm.enquiry}
          onBack={() => setActiveForm(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-3 max-w-7xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Enquiries"
          value={totalEnquiries}
          icon={ClipboardList}
          trend="+12% from last month"
          trendUp={true}
          color="emerald"
        />
        <StatsCard
          title="High Priority"
          value={highPriority}
          icon={Tag}
          trend="Needs attention"
          trendUp={false}
          color="amber"
        />
        <StatsCard
          title="New This Week"
          value={newEnquiries}
          icon={RefreshCw}
          trend="+5% from last week"
          trendUp={true}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <ClipboardList className="text-emerald-600" size={20} />
            Enquiry Register
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={() => setActiveForm({ mode: 'add' })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Plus size={16} />
              Add Enquiry
            </button>
            <button
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Export to Excel"
            >
              <FileDown size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Enquiry register table" className="min-w-[1200px]">
              <Table.Header>
                {TABLE_COLUMNS.map((col, index) => (
                  <Table.Column
                    key={col.key}
                    isRowHeader={index === 0}
                    className={`whitespace-nowrap ${col.align === 'center' ? 'text-center' : 'text-left'}`}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </Table.Column>
                ))}
                <Table.Column className="w-24 whitespace-nowrap text-center">Actions</Table.Column>
              </Table.Header>
              <Table.Body items={filteredItems} loadingState={isLoading ? 'loading' : 'idle'} loadingContent={<Spinner size="lg" color="primary" />} renderEmptyState={() => (
                isLoading ? null : (
                  <div className="py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                        <SlidersHorizontal size={32} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">No enquiries found. Try adjusting your search.</p>
                    </div>
                  </div>
                )
              )}>
                {(item) => (
                  <Table.Row key={item.id} className="group">
                    {TABLE_COLUMNS.map(col => (
                      <Table.Cell
                        key={col.key}
                        className={`text-slate-700 ${col.align === 'center' ? 'text-center' : 'text-left'} truncate`}
                        title={String(item[col.key] || '')}
                      >
                        {col.key === 'priority' ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            item[col.key] === 'High' ? 'bg-red-100 text-red-700' :
                            item[col.key] === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item[col.key] || '-'}
                          </span>
                        ) : (
                          item[col.key] || '-'
                        )}
                      </Table.Cell>
                    ))}
                    <Table.Cell>
                      <div className="flex items-center justify-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                        <button
                          onClick={() => setActiveForm({ mode: 'view', enquiry: item })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setActiveForm({ mode: 'edit', enquiry: item })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}
