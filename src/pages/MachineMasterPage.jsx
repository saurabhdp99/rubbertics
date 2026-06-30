import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Activity,
  ArrowLeft,
  Settings,
  Edit,
  Eye,
  FileDown,
  FileText,
  Hash,
  Plus,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Tag,
  Trash2,
  UploadCloud,
  X
} from 'lucide-react';
import { Table, Input, Select, Label, ListBox, DatePicker, DateField, Calendar, Spinner } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import StatsCard from '../components/common/StatsCard';
import { MACHINE_MASTER_FIELDS } from '../data/machineMasterTemplate';
import { useMachineMasterStore } from '../store/machineMasterStore';
import { useAuthStore } from '../store/authStore';

const EMPTY_MACHINE = MACHINE_MASTER_FIELDS.reduce((machine, field) => {
  machine[field.key] = field.type === 'attachments' ? [] : field.type === 'select' ? 'Active' : '';
  return machine;
}, {});

const TABLE_COLUMNS = MACHINE_MASTER_FIELDS.filter(f => f.type !== 'attachments').map(field => ({
  ...field,
  width: field.type === 'number' ? '120px' : field.type === 'select' || field.type === 'date' ? '130px' : '180px',
  align: field.type === 'number' ? 'right' : field.type === 'select' || field.type === 'date' ? 'center' : 'left',
}));

const SECTION_ORDER = ['Basic Details', 'Maintenance & Specs', 'Status & Responsibilities', 'Documents & Attachments'];

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  fileData: z.any().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileObject: z.any().optional()
});

const machineMasterSchema = z.object({
  machineCode: z.string().min(1, 'Machine code is required'),
  machineName: z.string().min(1, 'Machine name is required'),
  machineMake: z.string().optional(),
  machineModel: z.string().optional(),
  serialNo: z.string().optional(),
  machineSize: z.string().optional(),
  capacity: z.coerce.number().optional().or(z.literal('')),
  capacityUnit: z.string().optional(),
  departmentOfUse: z.string().optional(),
  locationArea: z.string().optional(),
  rubberProcess: z.string().optional(),
  powerHpKw: z.coerce.number().optional().or(z.literal('')),
  installationDate: z.string().optional(),
  pmFrequency: z.string().optional(),
  noOfStroke: z.coerce.number().optional().or(z.literal('')),
  criticality: z.string().optional(),
  machineCondition: z.string().optional(),
  responsiblePerson: z.string().optional(),
  status: z.string().optional(),
  remarks: z.string().optional(),
  machineAttachments: z.array(attachmentSchema).optional()
});

function AttachmentsField({ value, onChange, disabled }) {
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    const newAttachment = { id: crypto.randomUUID(), name: '', fileData: null, fileName: '', fileType: '' };
    onChange([...(value || []), newAttachment]);
  };

  const handleRemove = (id) => {
    onChange((value || []).filter(att => att.id !== id));
  };

  const handleUpdate = (id, updates) => {
    onChange((value || []).map(att => att.id === id ? { ...att, ...updates } : att));
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpdate(id, {
        fileObject: file,
        fileData: URL.createObjectURL(file), // temporary local URL for preview
        fileName: file.name,
        fileType: file.type
      });
    }
    e.target.value = null;
  };

  const triggerFileInput = (id) => {
    setEditingId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openFile = (fileData) => {
    if (!fileData) return;
    if (fileData.startsWith('blob:') || fileData.startsWith('http')) {
      window.open(fileData, '_blank');
    } else {
      // Legacy base64 support just in case
      const newTab = window.open();
      newTab.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(editingId, e)}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {(!value || value.length === 0) ? 'Attachments' : `Attachments (${value.length})`}
        </Label>
        {!disabled && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Plus size={14} /> Add Attachment
          </button>
        )}
      </div>

      {(!value || value.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <FileText size={32} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">No attachments added</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {value.map((att) => (
            <div key={att.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Enter attachment name (e.g. Inspection Report)"
                  value={att.name}
                  onChange={(e) => handleUpdate(att.id, { name: e.target.value })}
                  disabled={disabled}
                  className="w-full text-sm outline-none bg-slate-50 focus-within:bg-white transition-colors h-[42px] px-3 rounded-lg border border-slate-200 focus-within:border-emerald-500/50"
                  aria-label="Attachment Name"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {!att.fileData ? (
                  !disabled && (
                    <button
                      type="button"
                      onClick={() => triggerFileInput(att.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors h-[42px]"
                    >
                      <UploadCloud size={16} /> Upload File
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => openFile(att.fileData)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors truncate max-w-[200px] h-[42px]"
                    title={att.fileName}
                  >
                    <Eye size={16} className="shrink-0" /> <span className="truncate">{att.fileName}</span>
                  </button>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(att.id)}
                    className="p-2 h-[42px] w-[42px] flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove Attachment"
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

function FormField({ field, control, disabled, error, options, onAddOption, onRenameOption, onDeleteOption }) {
  if (field.type === 'attachments') {
    return (
      <div className="col-span-1 md:col-span-2 xl:col-span-3">
        <Controller
          control={control}
          name={field.key}
          render={({ field: { value, onChange } }) => (
            <AttachmentsField value={value} onChange={onChange} disabled={disabled} />
          )}
        />
      </div>
    );
  }

  const baseInputClass = `w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none ${error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-emerald-500/50'
    } input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`;
  const customClass = `${baseInputClass} px-4 py-3`;

  return (
    <Controller
      control={control}
      name={field.key}
      render={({ field: { onChange, value, onBlur, ref } }) => {
        if (field.type === 'select') {
          return (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {field.label}
                {['machineCode', 'machineName'].includes(field.key) && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                isDisabled={disabled}
                value={value || 'Active'}
                onChange={onChange}
                placeholder="Select status"
                aria-label={field.label}
              >
                <Select.Trigger className={customClass.replace('py-3', 'py-2').replace('px-4', 'px-3')}>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="Active" textValue="Active">
                      Active
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="Inactive" textValue="Inactive">
                      Inactive
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
          );
        }

        if (field.type === 'creatable-select') {
          return (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {field.label}
              </Label>
              <EditableCreatableSelect
                value={value || ''}
                options={options || field.options || []}
                disabled={disabled}
                placeholder={`Select ${field.label}`}
                onChange={onChange}
                onAdd={onAddOption}
                onRename={onRenameOption}
                onDelete={onDeleteOption}
              />
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
          );
        }

        if (field.type === 'options') {
          const OPTION_COLORS = {
            Critical: 'bg-red-50 text-red-700 border-red-200',
            High:     'bg-orange-50 text-orange-700 border-orange-200',
            Medium:   'bg-amber-50 text-amber-700 border-amber-200',
            Low:      'bg-emerald-50 text-emerald-700 border-emerald-200',
            Standby:  'bg-slate-50 text-slate-500 border-slate-200',
          };
          return (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {field.label}
              </Label>
              <Select
                isDisabled={disabled}
                value={value || ''}
                onChange={onChange}
                aria-label={field.label}
                placeholder={`Select ${field.label}`}
                className="w-full"
              >
                <Select.Trigger className={`h-[46px] px-4 text-[13px] font-medium rounded-xl border bg-white transition-all input-glow ${error ? 'border-red-300' : 'border-slate-200 focus-within:border-emerald-500/50'}`}>
                  <Select.Value>
                    {value ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${OPTION_COLORS[value] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {value}
                      </span>
                    ) : (
                      <span className="text-slate-400">{`Select ${field.label}`}</span>
                    )}
                  </Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {(field.options || []).map(opt => (
                      <ListBox.Item key={opt} id={opt} textValue={opt}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${OPTION_COLORS[opt] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {opt}
                        </span>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
          );
        }

        if (field.type === 'pm-frequency') {
          const parts = (value || '').toString().split(' ');
          const numVal = parts[0] || '';
          const unitVal = parts[1] || 'Day';
          const PM_UNITS = ['Day', 'Month', 'Year'];

          const handleNum = (e) => onChange(`${e.target.value} ${unitVal}`);
          const handleUnit = (val) => onChange(`${numVal} ${val}`);

          return (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {field.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={numVal}
                  disabled={disabled}
                  onChange={handleNum}
                  placeholder="e.g. 3"
                  aria-label="Frequency Value"
                  className={`flex-1 min-w-0 h-[46px] px-4 text-[13px] font-medium rounded-xl border bg-white transition-all input-glow ${error ? 'border-red-300' : 'border-slate-200 focus-within:border-emerald-500/50'}`}
                />
                <Select
                  isDisabled={disabled}
                  value={unitVal}
                  onChange={handleUnit}
                  aria-label="Frequency Unit"
                  className="w-[120px] shrink-0"
                >
                  <Select.Trigger className={`h-[46px] px-3 text-[13px] font-medium rounded-xl border bg-white transition-all input-glow ${error ? 'border-red-300' : 'border-slate-200 focus-within:border-emerald-500/50'}`}>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {PM_UNITS.map(unit => (
                        <ListBox.Item key={unit} id={unit} textValue={unit}>
                          {unit}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {field.label}
              {['machineCode', 'machineName'].includes(field.key) && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.type === 'textarea' ? (
              <textarea
                value={value ?? ''}
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                className={`${customClass} min-h-28 resize-y`}
                placeholder={field.label}
                ref={ref}
              />
            ) : field.type === 'date' ? (
              <DatePicker
                value={value ? parseDate(value) : null}
                isDisabled={disabled}
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
            ) : (
              <Input
                type={field.type === 'number' ? 'number' : 'text'}
                step={field.type === 'number' ? '0.01' : undefined}
                value={value ?? ''}
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                className={customClass}
                placeholder={field.label}
                aria-label={field.label}
                ref={ref}
              />
            )}
            {error && <span className="text-xs font-medium text-red-500">{error}</span>}
          </div>
        );
      }}
    />
  );
}

function MachineMasterForm({ mode, machine, onBack }) {
  const {
    machines,
    addMachine: addMachineMaster,
    updateMachine: updateMachineMaster,
    deleteMachine: deleteMachineMaster,
    lookups: machineMasterLookups,
    addLookupOption: addMachineMasterLookupOption,
    renameLookupOption: renameMachineMasterLookupOption,
    deleteLookupOption: deleteMachineMasterLookupOption,
  } = useMachineMasterStore();
  const { currentOrg, currentUser } = useAuthStore();

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const getInitialValues = () => {
    const initialForm = machine ? { ...EMPTY_MACHINE, ...machine } : { ...EMPTY_MACHINE };
    if (mode === 'add') {
      const nextNumber = machines.reduce((max, m) => {
        if (m.machineCode && m.machineCode.startsWith('M-')) {
          const num = parseInt(m.machineCode.substring(2), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }
        return max;
      }, 0) + 1;
      initialForm.machineCode = `M-${String(nextNumber).padStart(3, '0')}`;
    }
    return initialForm;
  };

  const { control, handleSubmit: hookFormSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(machineMasterSchema),
    defaultValues: getInitialValues()
  });

  useEffect(() => {
    reset(getInitialValues());
  }, [machine, mode, reset, machines]);

  const groupedFields = SECTION_ORDER.map(section => ({
    section,
    fields: MACHINE_MASTER_FIELDS.filter(field => field.section === section),
  }));

  const onSubmit = async (data) => {
    if (isAdd) await addMachineMaster(data, currentOrg?.id, currentUser?.id);
    else await updateMachineMaster(machine.id, data, currentUser?.id);
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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Settings size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Machine Master' : isAdd ? 'Add Machine Master' : 'Edit Machine Master'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watch('machineCode') || 'Manual entry for machine specifications'}
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
                form="machine-master-page-form"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Machine' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="machine-master-page-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
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
                      disabled={isView || isSubmitting || (isAdd && field.key === 'machineCode')}
                      error={errors[field.key]?.message}
                      options={machineMasterLookups[field.key]}
                      onAddOption={(val) => addMachineMasterLookupOption(field.key, val)}
                      onRenameOption={(oldVal, newVal) => renameMachineMasterLookupOption(field.key, oldVal, newVal)}
                      onDeleteOption={(val) => deleteMachineMasterLookupOption(field.key, val)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {!isView && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
              <div>
                {!isAdd && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete machine "${machine?.machineName || ''}"? This action cannot be undone.`)) {
                        const success = await deleteMachineMaster(machine.id);
                        if (success) onBack();
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete Machine
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
                  {isAdd ? 'Create Machine' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function MachineMasterPage() {
  const {
    machines: machineMasterItems,
    searchQuery: machineMasterSearchQuery,
    departmentFilter: machineMasterDepartmentFilter,
    statusFilter: machineMasterStatusFilter,
    currentPage: machineMasterCurrentPage,
    itemsPerPage: machineMasterItemsPerPage,
    setSearchQuery: setMachineMasterSearchQuery,
    setDepartmentFilter: setMachineMasterDepartmentFilter,
    setStatusFilter: setMachineMasterStatusFilter,
    setCurrentPage: setMachineMasterCurrentPage,
    setItemsPerPage: setMachineMasterItemsPerPage,
    deleteMachine: deleteMachineMaster,
    getFilteredMachines: getFilteredMachineMasterItems,
    getStats: getMachineMasterStats,
    fetchMachines, isLoading,
  } = useMachineMasterStore();
  const { currentOrg } = useAuthStore();

  useEffect(() => {
    if (currentOrg?.id) fetchMachines(currentOrg.id);
  }, [currentOrg?.id, fetchMachines]);

  const [viewState, setViewState] = useState({ type: 'table', mode: null, item: null });
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);

  const filtered = getFilteredMachineMasterItems();
  const stats = getMachineMasterStats();
  const totalPages = Math.ceil(filtered.length / machineMasterItemsPerPage);
  const pagedItems = filtered.slice(
    (machineMasterCurrentPage - 1) * machineMasterItemsPerPage,
    machineMasterCurrentPage * machineMasterItemsPerPage
  );

  const departments = useMemo(() => {
    return ['All', ...Array.from(new Set(machineMasterItems.map(machine => machine.departmentOfUse).filter(Boolean))).sort()];
  }, [machineMasterItems]);

  const openForm = (mode, item = null) => {
    setDeleteCandidateId(null);
    setViewState({ type: 'form', mode, item });
  };

  const backToTable = () => setViewState({ type: 'table', mode: null, item: null });

  const clearFilters = () => {
    setMachineMasterSearchQuery('');
    setMachineMasterDepartmentFilter('All');
    setMachineMasterStatusFilter('All');
  };


  const exportCsv = () => {
    const headers = MACHINE_MASTER_FIELDS.map(field => field.label);
    const rows = filtered.map(item => MACHINE_MASTER_FIELDS.map(field => String(item[field.key] ?? '').replaceAll('"', '""')));
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'machine-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (item, column) => {
    const value = item[column.key];

    if (column.key === 'machineCode') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }

    if (column.key === 'machineName') {
      return <span className="font-bold text-slate-800 line-clamp-2" title={value}>{value || '-'}</span>;
    }

    if (column.key === 'pmStatus') {
      let badgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
      if (value === 'OK') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (value === 'Due Soon') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      if (value === 'Overdue') badgeClass = 'bg-red-50 text-red-700 border-red-200';
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${badgeClass}`}>
          {value || '-'}
        </span>
      );
    }

    if (column.type === 'select') {
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${value === 'Active'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
          {value || 'Inactive'}
        </span>
      );
    }

    if (column.type === 'number') {
      const numericValue = value === '' || value === null || value === undefined ? null : Number(value);
      return <span className="font-semibold text-slate-800">{numericValue === null || Number.isNaN(numericValue) ? '-' : numericValue.toFixed(2)}</span>;
    }

    if (column.type === 'date') {
      if (!value) return '-';
      return <span className="whitespace-nowrap">{new Date(value).toLocaleDateString('en-GB')}</span>;
    }

    return <span className="block max-w-[220px] truncate" title={value}>{value || '-'}</span>;
  };

  return (
    <div className="p-3 max-w-[1920px] mx-auto animate-slide-up">
      {viewState.type !== 'form' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatsCard label="Total Machines" value={stats.total.toLocaleString()} icon={Settings} color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.25)" animationDelay={0} />
          <StatsCard label="Active" value={stats.active.toLocaleString()} icon={Activity} color="#6366f1" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.25)" animationDelay={50} />
          <StatsCard label="Inactive" value={stats.inactive.toLocaleString()} icon={Trash2} color="#f59e0b" bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.25)" animationDelay={100} />
        </div>
      )}

      {viewState.type === 'form' ? (
        <MachineMasterForm
          key={`${viewState.mode}-${viewState.item?.id || 'new'}`}
          mode={viewState.mode}
          machine={viewState.item}
          onBack={backToTable}
        />
      ) : (
        <>
          <div className="glass-card rounded-2xl p-5 shadow-xl mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full min-w-0 group">
                <Input
                  type="text"
                  placeholder="Search by code, name, type, serial no..."
                  value={machineMasterSearchQuery}
                  onChange={event => setMachineMasterSearchQuery(event.target.value)}
                  aria-label="Search machines"
                  className="w-full pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-emerald-500/50 bg-white border border-slate-200"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <Select
                  value={machineMasterDepartmentFilter}
                  onChange={(val) => setMachineMasterDepartmentFilter(val)}
                  className="w-[180px]"
                  aria-label="Department Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {departments.map(dept => (
                        <ListBox.Item key={dept} id={dept} textValue={dept === 'All' ? 'All Departments' : dept}>
                          {dept === 'All' ? 'All Departments' : dept}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  value={machineMasterStatusFilter}
                  onChange={(val) => setMachineMasterStatusFilter(val)}
                  className="w-[140px]"
                  aria-label="Status Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {['All', 'Active', 'Inactive'].map(status => (
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
                  Add Machine
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{machineMasterItems.length}</span> machines
              </p>
              {(machineMasterSearchQuery || machineMasterDepartmentFilter !== 'All' || machineMasterStatusFilter !== 'All') && (
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
                  aria-label="Machine master table"
                  className="text-left"
                  style={{ minWidth: `${TABLE_COLUMNS.length * 150 + 150}px` }}
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
                  <Table.Body items={pagedItems} loadingState={isLoading ? 'loading' : 'idle'} loadingContent={<Spinner size="lg" color="primary" />} renderEmptyState={() => (
                    isLoading ? null : (
                      <div className="py-24 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                            <SlidersHorizontal size={32} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-medium">No machines found. Try adjusting your filters.</p>
                        </div>
                      </div>
                    )
                  )}>
                    {(item) => (
                      <Table.Row key={item.id} className="group">
                        <Table.Cell>
                            <div className="flex items-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                              <button onClick={() => openForm('view', item)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all" title="View">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => openForm('edit', item)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all" title="Edit">
                                <Edit size={15} />
                              </button>
                            </div>
                        </Table.Cell>
                        {TABLE_COLUMNS.map(column => (
                          <Table.Cell key={column.key} className="text-[13px] text-slate-700" style={{ textAlign: column.align || 'left' }}>
                            {renderCellValue(item, column)}
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
                  value={machineMasterItemsPerPage.toString()}
                  onChange={(val) => setMachineMasterItemsPerPage(Number(val))}
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
                  onClick={() => setMachineMasterCurrentPage(Math.max(1, machineMasterCurrentPage - 1))}
                  disabled={machineMasterCurrentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: Math.min(5, totalPages || 1) }, (_, index) => {
                    let page;
                    if (totalPages <= 5) page = index + 1;
                    else if (machineMasterCurrentPage <= 3) page = index + 1;
                    else if (machineMasterCurrentPage >= totalPages - 2) page = totalPages - 4 + index;
                    else page = machineMasterCurrentPage - 2 + index;

                    return (
                      <button
                        key={page}
                        onClick={() => setMachineMasterCurrentPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${machineMasterCurrentPage === page
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
                  onClick={() => setMachineMasterCurrentPage(Math.min(totalPages, machineMasterCurrentPage + 1))}
                  disabled={machineMasterCurrentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{machineMasterCurrentPage}</span> of{' '}
                <span className="text-slate-800">{totalPages || 1}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
