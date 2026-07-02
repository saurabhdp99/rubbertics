import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Beaker,
  Check,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileDown,
  FileText,
  Hash,
  History,
  Info,
  Plus,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Tag,
  Trash2,
  UploadCloud,
  X,
  AlertCircle
} from 'lucide-react';
import { Table, Input, Select, Label, ListBox, DatePicker, DateField, Calendar, Spinner, Modal } from '@heroui/react';
import { parseDate } from '@internationalized/date';

const safeParseDate = (val) => {
  if (!val) return null;
  try {
    const cleanStr = String(val).split('T')[0].split(' ')[0];
    return parseDate(cleanStr);
  } catch (e) {
    return null;
  }
};

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import StatsCard from '../components/common/StatsCard';
import { COMPOUND_MASTER_FIELDS } from '../data/compoundMasterTemplate';
import { useCompoundMasterStore } from '../store/compoundMasterStore';
import { useAuthStore } from '../store/authStore';

const EMPTY_COMPOUND = COMPOUND_MASTER_FIELDS.reduce((comp, field) => {
  comp[field.key] = field.type === 'attachments' ? [] : field.type === 'select' ? 'Active' : field.type === 'number' ? '' : '';
  return comp;
}, { formulation: [], totalOutput: 0, lessWeightLoss: 0, netWeight: 0, grossWeight: 0, changeSummary: '' });

const TABLE_COLUMNS = [
  { key: 'compoundCode', label: 'Compound Code', width: '130px', align: 'left' },
  { key: 'compoundName', label: 'Compound Name', width: '200px', align: 'left' },
  { key: 'compoundColour', label: 'Colour', width: '130px', align: 'center' },
  { key: 'hardnessShoreA', label: 'Hardness', width: '140px', align: 'left' },
  { key: 'specificGravity', label: 'Sp. Gravity', width: '130px', align: 'left' },
  { key: 'totalOutput', label: 'Formulation Qty', width: '150px', align: 'right', type: 'number' },
  { key: 'revisionNumber', label: 'Revision', width: '100px', align: 'center' },
  { key: 'revisionDate', label: 'Rev. Date', width: '120px', align: 'center', type: 'date' },
  { key: 'status', label: 'Status', width: '130px', align: 'center', type: 'select' },
];

const REQUIRED_FIELDS = [
  'compoundCode',
  'compoundName',
  'compoundColour',
  'hardnessShoreA',
  'specificGravity'
];

const OPTION_COLORS = {
  'Black': 'bg-slate-900 text-white border-slate-700',
  'Red': 'bg-red-50 text-red-700 border-red-200',
  'Blue': 'bg-blue-50 text-blue-700 border-blue-200',
  'Green': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Yellow': 'bg-amber-50 text-amber-800 border-amber-200',
  'White': 'bg-slate-50 text-slate-700 border-slate-200',
  'Translucent': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Grey': 'bg-slate-200 text-slate-800 border-slate-300',
  'Orange': 'bg-orange-50 text-orange-700 border-orange-200',
  'Brown': 'bg-amber-100 text-amber-900 border-amber-300',
  'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Inactive': 'bg-slate-100 text-slate-500 border-slate-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Obsolete': 'bg-red-50 text-red-700 border-red-200',
};

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  fileData: z.any().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileObject: z.any().optional()
});

const compoundMasterSchema = z.object({
  compoundCode: z.string().min(1, 'Compound code is required'),
  compoundName: z.string().min(1, 'Compound name is required'),
  compoundColour: z.string().min(1, 'Compound colour is required'),
  formulation: z.array(z.object({
    id: z.string(),
    particular: z.string().min(1, 'Ingredient required'),
    quantity: z.coerce.number().min(0, 'Min 0'),
    uom: z.string().min(1, 'UOM required')
  })).optional(),
  totalOutput: z.coerce.number().optional(),
  lessWeightLoss: z.coerce.number().optional(),
  netWeight: z.coerce.number().optional(),
  grossWeight: z.coerce.number().optional(),
  hardnessShoreA: z.string().optional(),
  specificGravity: z.string().optional(),
  mooneyViscosity: z.string().optional(),
  tensileStrengthMpa: z.string().optional(),
  elongationPercent: z.string().optional(),
  tearStrength: z.string().optional(),
  compressionSetPercent: z.string().optional(),
  shelfLifeDays: z.coerce.number().optional().or(z.literal('')),
  storageLifeDays: z.coerce.number().optional().or(z.literal('')),
  storageCondition: z.string().optional(),
  specialInstruction: z.string().optional(),
  revisionNumber: z.coerce.number().optional(),
  revisionDate: z.string().optional(),
  status: z.string().optional(),
  remarks: z.string().optional(),
  changeSummary: z.string().optional(),
  compoundAttachments: z.array(attachmentSchema).optional()
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
        fileData: URL.createObjectURL(file),
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
          <UploadCloud size={28} className="mb-2 opacity-50" />
          <p className="text-xs font-medium">No files attached yet</p>
          {!disabled && <p className="text-[11px] mt-0.5 opacity-75">Click "Add Attachment" above to upload documents</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {value.map((att, index) => (
            <div key={att.id} className="flex flex-col p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-700 block truncate">
                      {att.fileName || `Attachment #${index + 1}`}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">
                      {att.fileType ? att.fileType.split('/')[1] || 'FILE' : 'Pending Upload'}
                    </span>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(att.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove attachment"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Name / Title</Label>
                <Input
                  type="text"
                  placeholder="e.g. Lab Report, Curing Specs"
                  value={att.name || ''}
                  disabled={disabled}
                  onChange={(e) => handleUpdate(att.id, { name: e.target.value })}
                  className="w-full text-xs h-9 rounded-lg border border-slate-200 px-3 bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-0.5">
                {att.fileData ? (
                  <button
                    type="button"
                    onClick={() => openFile(att.fileData)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                  >
                    <Eye size={13} /> View File
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">No file selected</span>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => triggerFileInput(att.id)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {att.fileName ? 'Change File' : 'Upload File'}
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
  const isRequired = REQUIRED_FIELDS.includes(field.key);

  if (field.type === 'attachments') {
    return (
      <div className="col-span-1 md:col-span-2 xl:col-span-3">
        <Controller
          name="compoundAttachments"
          control={control}
          render={({ field: { value, onChange } }) => (
            <AttachmentsField value={value} onChange={onChange} disabled={disabled} />
          )}
        />
      </div>
    );
  }

  const customClass = `w-full h-[46px] px-4 text-[13px] font-medium rounded-xl border bg-white transition-all input-glow ${error ? 'border-red-300' : 'border-slate-200 focus-within:border-emerald-500/50'}`;
  const baseInputClass = `w-full rounded-xl border bg-white transition-all input-glow ${error ? 'border-red-300' : 'border-slate-200 focus-within:border-emerald-500/50'}`;

  return (
    <Controller
      name={field.key}
      control={control}
      render={({ field: { value, onChange, onBlur, ref } }) => {
        if (field.type === 'creatable-select') {
          return (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <EditableCreatableSelect
                options={options || field.options || []}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                placeholder={`Select or create ${field.label}`}
                error={error}
                onAdd={onAddOption}
                onRename={onRenameOption}
                onDelete={onDeleteOption}
              />
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
          );
        }

        if (field.type === 'select') {
          return (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
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
                    {(field.options || ['Active', 'Inactive', 'Under Review', 'Obsolete']).map(opt => (
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

        return (
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.type === 'textarea' ? (
              <textarea
                value={value ?? ''}
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                className={`${customClass} min-h-28 resize-y`}
                placeholder={field.placeholder || field.label}
                ref={ref}
              />
            ) : field.type === 'date' ? (
              <DatePicker
                value={safeParseDate(value)}
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
                placeholder={field.placeholder || field.label}
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

// ── Formulation Table Component ──────────────────────────────────────────
function FormulationSection({ control, disabled, watch, setValue }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "formulation",
  });

  const formulationItems = watch("formulation") || [];
  const lessWeightLoss = watch("lessWeightLoss") || 0;
  const grossWeight = watch("grossWeight") || 0;

  // Calculate totals
  const totalOutput = useMemo(() => {
    return formulationItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [formulationItems]);

  const netWeight = useMemo(() => {
    const loss = Number(lessWeightLoss) || 0;
    return totalOutput * (1 - loss / 100);
  }, [totalOutput, lessWeightLoss]);

  useEffect(() => {
    setValue("totalOutput", Number(totalOutput.toFixed(4)));
    setValue("netWeight", Number(netWeight.toFixed(4)));
  }, [totalOutput, netWeight, setValue]);

  const uomOptions = ['kg', 'g', 'ltrs', 'ml', 'phr', '%', 'pcs'];

  return (
    <section className="border-b border-slate-100 pb-7">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Beaker size={15} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Formulation</h3>
            <p className="text-xs text-slate-400 font-medium">Add ingredients and quantities to calculate compound weights</p>
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => append({ id: crypto.randomUUID(), particular: '', quantity: 0, uom: 'kg' })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} /> Add Ingredient
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4 min-w-[240px]">Particular (Ingredient Name)</th>
                <th className="py-3 px-4 w-[160px]">Quantity</th>
                <th className="py-3 px-4 w-[140px]">UOM</th>
                {!disabled && <th className="py-3 px-4 w-[60px] text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={disabled ? 4 : 5} className="py-8 text-center text-slate-400 italic">
                    No ingredients added. {!disabled && 'Click "Add Ingredient" above to start building formulation.'}
                  </td>
                </tr>
              ) : (
                fields.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-4">
                      <Controller
                        name={`formulation.${index}.particular`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            disabled={disabled}
                            placeholder="e.g. Silicon 20H 3420"
                            className="w-full text-xs h-9 rounded-lg border border-slate-200 px-3 bg-white focus:border-emerald-500 outline-none"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Controller
                        name={`formulation.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            step="0.0001"
                            {...field}
                            disabled={disabled}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs h-9 rounded-lg border border-slate-200 px-3 bg-white font-semibold text-slate-800 text-right focus:border-emerald-500 outline-none"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Controller
                        name={`formulation.${index}.uom`}
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            disabled={disabled}
                            className="w-full text-xs h-9 rounded-lg border border-slate-200 px-2.5 bg-white font-medium text-slate-700 focus:border-emerald-500 outline-none"
                          >
                            {uomOptions.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        )}
                      />
                    </td>
                    {!disabled && (
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}

              {/* Summary Rows matching spreadsheet */}
              <tr className="bg-slate-100/80 font-black text-slate-800 border-t-2 border-slate-200">
                <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-xs">Total - Output</td>
                <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">{totalOutput.toFixed(4)}</td>
                <td colSpan={disabled ? 1 : 2} className="py-3 px-4 text-slate-500 text-xs">
                  {formulationItems[0]?.uom || 'kg'}
                </td>
              </tr>

              <tr className="bg-slate-50 font-bold text-slate-700">
                <td colSpan={2} className="py-2.5 px-4 text-right text-xs">Less Weight loss (%)</td>
                <td className="py-2.5 px-4">
                  <Controller
                    name="lessWeightLoss"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={disabled}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white font-bold text-slate-800 text-right outline-none"
                      />
                    )}
                  />
                </td>
                <td colSpan={disabled ? 1 : 2} className="py-2.5 px-4 text-slate-500 font-bold">%</td>
              </tr>

              <tr className="bg-emerald-50/50 font-black text-slate-800 border-t border-emerald-100">
                <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-xs text-emerald-800">Net Weight</td>
                <td className="py-3 px-4 text-right font-black text-emerald-800 text-sm">{netWeight.toFixed(4)}</td>
                <td colSpan={disabled ? 1 : 2} className="py-3 px-4 text-slate-500 text-xs font-bold">
                  {formulationItems[0]?.uom || 'kg'}
                </td>
              </tr>

              <tr className="bg-white font-bold text-slate-700">
                <td colSpan={2} className="py-2.5 px-4 text-right text-xs">Gross Weight</td>
                <td className="py-2.5 px-4">
                  <Controller
                    name="grossWeight"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.0001"
                        {...field}
                        disabled={disabled}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white font-bold text-slate-800 text-right outline-none"
                      />
                    )}
                  />
                </td>
                <td colSpan={disabled ? 1 : 2} className="py-2.5 px-4 text-slate-500 text-xs font-bold">
                  {formulationItems[0]?.uom || 'kg'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Revision History Modal ───────────────────────────────────────────────
function RevisionHistoryModal({ isOpen, onClose, compoundId, compoundName }) {
  const { fetchCompoundHistory, historyMap, isHistoryLoading } = useCompoundMasterStore();
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  useEffect(() => {
    if (isOpen && compoundId) {
      fetchCompoundHistory(compoundId);
      setSelectedSnapshot(null);
    }
  }, [isOpen, compoundId, fetchCompoundHistory]);

  if (!isOpen) return null;

  const history = historyMap[compoundId] || [];

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Container>
        <Modal.Dialog className="max-w-[1100px] w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col p-0">
          {/* Header */}
          <Modal.Header className="flex items-center justify-between border-b border-slate-100 py-4 px-6 bg-slate-50/80 m-0 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <History size={20} />
              </div>
              <div>
                <Modal.Heading className="text-lg font-black text-slate-800 m-0">Modified Revision History</Modal.Heading>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Audit trail & snapshots for <span className="font-bold text-slate-700">{compoundName}</span></p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </Modal.Header>

          {/* Body */}
          <Modal.Body className="p-6 overflow-y-auto flex-1 m-0 w-full">
            {isHistoryLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Spinner size="lg" color="primary" />
                <p className="text-sm font-medium">Loading historical revisions...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <AlertCircle size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-600">No modification history recorded yet.</p>
                <p className="text-xs mt-1">Revisions are automatically logged whenever a compound formulation or quality parameter is updated.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Timeline List */}
                <div className="lg:col-span-5 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Revisions ({history.length})
                  </Label>
                  {history.map((rev, index) => {
                    const isSelected = selectedSnapshot?.id === rev.id || (!selectedSnapshot && index === 0);
                    return (
                      <div
                        key={rev.id}
                        onClick={() => setSelectedSnapshot(rev)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 shadow-md shadow-indigo-500/10'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-sm">
                            Rev {rev.revisionNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> {new Date(rev.revisionDate || rev.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-800 line-clamp-2">
                          {rev.changeSummary}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500 mt-1">
                          <span>Modified by: <strong className="text-slate-700">{rev.modifiedBy}</strong></span>
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                            View Snapshot <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Snapshot Detail View */}
                <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col gap-5 max-h-[600px] overflow-y-auto">
                  {(() => {
                    const activeRev = selectedSnapshot || history[0];
                    if (!activeRev) return null;
                    const snap = activeRev.snapshot || {};
                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Archived Snapshot</span>
                            <h4 className="text-base font-black text-slate-800 mt-0.5">
                              Revision {activeRev.revisionNumber} ({snap.compoundCode || 'N/A'})
                            </h4>
                          </div>
                          <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                            Status: <strong className="text-emerald-700">{snap.status || 'Active'}</strong>
                          </span>
                        </div>

                        {/* Formulation table in snapshot */}
                        <div>
                          <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Beaker size={14} className="text-emerald-600" /> Formulation at this revision
                          </h5>
                          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                            <table className="w-full text-left">
                              <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                                <tr>
                                  <th className="py-2 px-3">Particular</th>
                                  <th className="py-2 px-3 text-right">Qty</th>
                                  <th className="py-2 px-3">UOM</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {(snap.formulation || []).length === 0 ? (
                                  <tr><td colSpan={3} className="py-4 text-center text-slate-400 italic">No formulation items recorded</td></tr>
                                ) : (
                                  snap.formulation.map((fItem, i) => (
                                    <tr key={fItem.id || i}>
                                      <td className="py-2 px-3 font-semibold text-slate-800">{fItem.particular}</td>
                                      <td className="py-2 px-3 text-right font-bold text-emerald-700">{Number(fItem.quantity || 0).toFixed(4)}</td>
                                      <td className="py-2 px-3 text-slate-500">{fItem.uom}</td>
                                    </tr>
                                  ))
                                )}
                                <tr className="bg-slate-50 font-black border-t border-slate-200">
                                  <td className="py-2 px-3 text-right">Total Output:</td>
                                  <td className="py-2 px-3 text-right text-emerald-800">{Number(snap.totalOutput || 0).toFixed(4)}</td>
                                  <td className="py-2 px-3 text-slate-500">{(snap.formulation && snap.formulation[0]?.uom) || 'kg'}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Quality parameters in snapshot */}
                        <div>
                          <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Activity size={14} className="text-indigo-600" /> Quality Parameters
                          </h5>
                          <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Hardness (Shore A)</span>
                              <span className="font-bold text-slate-800 mt-0.5 block">{snap.hardnessShoreA || '-'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Specific Gravity</span>
                              <span className="font-bold text-slate-800 mt-0.5 block">{snap.specificGravity || '-'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Mooney Viscosity</span>
                              <span className="font-bold text-slate-800 mt-0.5 block">{snap.mooneyViscosity || '-'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tensile Strength</span>
                              <span className="font-bold text-slate-800 mt-0.5 block">{snap.tensileStrengthMpa || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Storage in snapshot */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Storage Conditions & Life</span>
                          <p className="font-medium text-slate-700 mt-1">
                            Condition: <strong className="text-slate-900">{snap.storageCondition || 'Standard'}</strong> | Shelf Life: <strong className="text-slate-900">{snap.shelfLifeDays || 0} days</strong>
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer className="border-t border-slate-100 py-3 px-6 bg-slate-50/50 flex justify-end m-0 w-full">
            <button onClick={onClose} type="button" className="font-bold text-sm px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors">
              Close History
            </button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

// ── Form View ────────────────────────────────────────────────────────────
function CompoundMasterForm({ mode, compound, onBack }) {
  const {
    compounds,
    addCompound: addCompoundMaster,
    updateCompound: updateCompoundMaster,
    deleteCompound: deleteCompoundMaster,
    lookups: compoundMasterLookups,
    addLookupOption: addCompoundMasterLookupOption,
    renameLookupOption: renameCompoundMasterLookupOption,
    deleteLookupOption: deleteCompoundMasterLookupOption,
  } = useCompoundMasterStore();
  const { currentOrg, currentUser } = useAuthStore();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const getInitialValues = () => {
    const initialForm = compound ? { ...EMPTY_COMPOUND, ...compound, changeSummary: '' } : { ...EMPTY_COMPOUND };
    if (mode === 'add') {
      const nextNumber = compounds.reduce((max, c) => {
        if (c.compoundCode && c.compoundCode.startsWith('C-')) {
          const num = parseInt(c.compoundCode.substring(2), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }
        return max;
      }, 0) + 1;
      initialForm.compoundCode = `C-${String(nextNumber).padStart(3, '0')}`;
      initialForm.formulation = [
        { id: crypto.randomUUID(), particular: 'Silicon 20H 3420', quantity: 5, uom: 'kg' },
        { id: crypto.randomUUID(), particular: 'Silicon 30H 3430', quantity: 5, uom: 'kg' },
      ];
      initialForm.status = 'Active';
      initialForm.revisionNumber = 0;
    }
    return initialForm;
  };

  const { control, handleSubmit: hookFormSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(compoundMasterSchema),
    defaultValues: getInitialValues()
  });

  useEffect(() => {
    reset(getInitialValues());
  }, [compound, mode, reset, compounds]);

  const onSubmit = async (data) => {
    if (isAdd) {
      await addCompoundMaster(data, currentOrg?.id, currentUser?.id);
    } else {
      await updateCompoundMaster(compound.id, data, data.changeSummary || 'Updated compound formulation', currentUser?.id);
    }
    onBack();
  };

  const basicDetailsFields = COMPOUND_MASTER_FIELDS.filter(f => f.section === 'Compound Details');
  const qualityFields = COMPOUND_MASTER_FIELDS.filter(f => f.section === 'Quality Tab');
  const storageFields = COMPOUND_MASTER_FIELDS.filter(f => f.section === 'Storage and Life');
  const specialFields = COMPOUND_MASTER_FIELDS.filter(f => f.section === 'Special Instruction');
  const detailsFields = COMPOUND_MASTER_FIELDS.filter(f => f.section === 'Details' || f.section === 'Status' || f.section === 'Remarks');
  const attachmentFields = COMPOUND_MASTER_FIELDS.filter(f => f.section === 'Documents & Attachments');

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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Beaker size={24} className="text-emerald-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {isView ? 'View Compound Master' : isAdd ? 'Add Compound Master' : 'Edit Compound Master'}
                </h2>
                {!isAdd && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Rev {watch('revisionNumber') || 0}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watch('compoundCode') || 'Formulation and specification master'} {watch('compoundName') ? `— ${watch('compoundName')}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isAdd && (
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-sm"
              >
                <History size={16} />
                Modified History
              </button>
            )}
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
                form="compound-master-page-form"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Compound' : 'Save Revision'}
              </button>
            )}
          </div>
        </div>

        <form id="compound-master-page-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-8">
            {/* 1. Compound Details */}
            <section className="border-b border-slate-100 pb-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Tag size={15} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Compound Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {basicDetailsFields.map(field => (
                  <FormField
                    key={field.key}
                    field={field}
                    control={control}
                    disabled={isView || isSubmitting || (isAdd && field.key === 'compoundCode')}
                    error={errors[field.key]?.message}
                    options={compoundMasterLookups[field.key]}
                    onAddOption={(val) => addCompoundMasterLookupOption(field.key, val)}
                    onRenameOption={(oldVal, newVal) => renameCompoundMasterLookupOption(field.key, oldVal, newVal)}
                    onDeleteOption={(val) => deleteCompoundMasterLookupOption(field.key, val)}
                  />
                ))}
              </div>
            </section>

            {/* 2. Formulation Table */}
            <FormulationSection control={control} disabled={isView || isSubmitting} watch={watch} setValue={setValue} />

            {/* 3. Quality Tab */}
            <section className="border-b border-slate-100 pb-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Activity size={15} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Quality Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {qualityFields.map(field => (
                  <FormField
                    key={field.key}
                    field={field}
                    control={control}
                    disabled={isView || isSubmitting}
                    error={errors[field.key]?.message}
                  />
                ))}
              </div>
            </section>

            {/* 4. Storage and Life */}
            <section className="border-b border-slate-100 pb-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Clock size={15} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Storage and Life</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {storageFields.map(field => (
                  <FormField
                    key={field.key}
                    field={field}
                    control={control}
                    disabled={isView || isSubmitting}
                    error={errors[field.key]?.message}
                    options={compoundMasterLookups[field.key]}
                    onAddOption={(val) => addCompoundMasterLookupOption(field.key, val)}
                    onRenameOption={(oldVal, newVal) => renameCompoundMasterLookupOption(field.key, oldVal, newVal)}
                    onDeleteOption={(val) => deleteCompoundMasterLookupOption(field.key, val)}
                  />
                ))}
              </div>
            </section>

            {/* 5. Special Instructions & Remarks */}
            <section className="border-b border-slate-100 pb-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Special Instruction</h4>
                  {specialFields.map(field => (
                    <FormField key={field.key} field={field} control={control} disabled={isView || isSubmitting} />
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Status & Remarks</h4>
                  <div className="flex flex-col gap-4">
                    {detailsFields.map(field => (
                      <FormField key={field.key} field={field} control={control} disabled={isView || isSubmitting || field.key === 'revisionNumber' || field.key === 'revisionDate'} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Reason for Revision / Change Summary (when editing) */}
            {!isView && !isAdd && (
              <section className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Info size={16} className="text-indigo-600" /> Reason for Revision / Change Summary
                </div>
                <Controller
                  name="changeSummary"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. Adjusted Silicon 20H from 5 to 6 kg to improve tear strength (Will log as Rev X)"
                      className="w-full text-xs h-10 rounded-xl border border-indigo-200 px-3 bg-white focus:border-indigo-500 outline-none"
                    />
                  )}
                />
              </section>
            )}

            {/* 7. Attachments */}
            <section>
              {attachmentFields.map(field => (
                <FormField key={field.key} field={field} control={control} disabled={isView || isSubmitting} />
              ))}
            </section>
          </div>

          {!isView && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
              <div>
                {!isAdd && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete compound "${compound?.compoundName || ''}"? This action cannot be undone.`)) {
                        const success = await deleteCompoundMaster(compound.id);
                        if (success) onBack();
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete Compound
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
                  {isAdd ? 'Create Compound' : 'Save Revision'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <RevisionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        compoundId={compound?.id}
        compoundName={compound?.compoundName || compound?.compoundCode}
      />
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────
export default function CompoundMasterPage() {
  const {
    compounds: compoundMasterItems,
    searchQuery: compoundMasterSearchQuery,
    colourFilter: compoundMasterColourFilter,
    statusFilter: compoundMasterStatusFilter,
    currentPage: compoundMasterCurrentPage,
    itemsPerPage: compoundMasterItemsPerPage,
    setSearchQuery: setCompoundMasterSearchQuery,
    setColourFilter: setCompoundMasterColourFilter,
    setStatusFilter: setCompoundMasterStatusFilter,
    setCurrentPage: setCompoundMasterCurrentPage,
    setItemsPerPage: setCompoundMasterItemsPerPage,
    deleteCompound: deleteCompoundMaster,
    getFilteredCompounds: getFilteredCompoundMasterItems,
    getStats: getCompoundMasterStats,
    fetchCompounds, isLoading,
  } = useCompoundMasterStore();
  const { currentOrg } = useAuthStore();

  useEffect(() => {
    if (currentOrg?.id) fetchCompounds(currentOrg.id);
  }, [currentOrg?.id, fetchCompounds]);

  const [viewState, setViewState] = useState({ type: 'table', mode: null, item: null });
  const [historyModalItem, setHistoryModalItem] = useState(null);

  const filtered = getFilteredCompoundMasterItems();
  const stats = getCompoundMasterStats();
  const totalPages = Math.ceil(filtered.length / compoundMasterItemsPerPage);
  const pagedItems = filtered.slice(
    (compoundMasterCurrentPage - 1) * compoundMasterItemsPerPage,
    compoundMasterCurrentPage * compoundMasterItemsPerPage
  );

  const colours = useMemo(() => {
    return ['All', ...Array.from(new Set(compoundMasterItems.map(c => c.compoundColour).filter(Boolean))).sort()];
  }, [compoundMasterItems]);

  const openForm = (mode, item = null) => {
    setViewState({ type: 'form', mode, item });
  };

  const backToTable = () => setViewState({ type: 'table', mode: null, item: null });

  const clearFilters = () => {
    setCompoundMasterSearchQuery('');
    setCompoundMasterColourFilter('All');
    setCompoundMasterStatusFilter('All');
  };

  const exportCsv = () => {
    const headers = ['Compound Code', 'Compound Name', 'Colour', 'Hardness', 'Sp. Gravity', 'Total Qty', 'Revision', 'Status'];
    const rows = filtered.map(item => [
      item.compoundCode, item.compoundName, item.compoundColour, item.hardnessShoreA, item.specificGravity, item.totalOutput, item.revisionNumber, item.status
    ].map(cell => `"${String(cell ?? '').replaceAll('"', '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compound-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (item, column) => {
    const value = item[column.key];

    if (column.key === 'compoundCode') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }

    if (column.key === 'compoundName') {
      return <span className="font-bold text-slate-800 line-clamp-2" title={value}>{value || '-'}</span>;
    }

    if (column.key === 'compoundColour') {
      const colorStyle = OPTION_COLORS[value] || 'bg-slate-100 text-slate-700 border-slate-300';
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${colorStyle}`}>
          {value || '-'}
        </span>
      );
    }

    if (column.key === 'revisionNumber') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); setHistoryModalItem(item); }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
          title="Click to view modification history"
        >
          <History size={12} /> Rev {value || 0}
        </button>
      );
    }

    if (column.type === 'select') {
      let badgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
      if (value === 'Active') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (value === 'Under Review') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      if (value === 'Obsolete') badgeClass = 'bg-red-50 text-red-700 border-red-200';
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${badgeClass}`}>
          {value || 'Inactive'}
        </span>
      );
    }

    if (column.type === 'number') {
      const numericValue = value === '' || value === null || value === undefined ? null : Number(value);
      return <span className="font-semibold text-slate-800">{numericValue === null || Number.isNaN(numericValue) ? '-' : numericValue.toFixed(4)}</span>;
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Total Compounds" value={stats.total.toLocaleString()} icon={Beaker} color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.25)" animationDelay={0} />
          <StatsCard label="Active Compounds" value={stats.active.toLocaleString()} icon={Activity} color="#6366f1" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.25)" animationDelay={50} />
          <StatsCard label="Under Review" value={stats.underReview.toLocaleString()} icon={SlidersHorizontal} color="#f59e0b" bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.25)" animationDelay={100} />
          <StatsCard label="Obsolete / Inactive" value={stats.obsolete.toLocaleString()} icon={Trash2} color="#ef4444" bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.25)" animationDelay={150} />
        </div>
      )}

      {viewState.type === 'form' ? (
        <CompoundMasterForm
          key={`${viewState.mode}-${viewState.item?.id || 'new'}`}
          mode={viewState.mode}
          compound={viewState.item}
          onBack={backToTable}
        />
      ) : (
        <>
          <div className="glass-card rounded-2xl p-5 shadow-xl mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full min-w-0 group">
                <Input
                  type="text"
                  placeholder="Search by code, name, colour, hardness, ingredients..."
                  value={compoundMasterSearchQuery}
                  onChange={event => setCompoundMasterSearchQuery(event.target.value)}
                  aria-label="Search compounds"
                  className="w-full pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-emerald-500/50 bg-white border border-slate-200"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <Select
                  value={compoundMasterColourFilter}
                  onChange={(val) => setCompoundMasterColourFilter(val)}
                  className="w-[160px]"
                  aria-label="Colour Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {colours.map(col => (
                        <ListBox.Item key={col} id={col} textValue={col === 'All' ? 'All Colours' : col}>
                          {col === 'All' ? 'All Colours' : col}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  value={compoundMasterStatusFilter}
                  onChange={(val) => setCompoundMasterStatusFilter(val)}
                  className="w-[160px]"
                  aria-label="Status Filter"
                >
                  <Select.Trigger className="px-4 py-3 h-[46px] text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {['All', 'Active', 'Under Review', 'Inactive', 'Obsolete'].map(status => (
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
                  Add Compound
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{compoundMasterItems.length}</span> compounds
              </p>
              {(compoundMasterSearchQuery || compoundMasterColourFilter !== 'All' || compoundMasterStatusFilter !== 'All') && (
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
                  aria-label="Compound master table"
                  className="text-left"
                  style={{ minWidth: `${TABLE_COLUMNS.length * 140 + 150}px` }}
                >
                  <Table.Header>
                    <Table.Column isRowHeader className="w-32 whitespace-nowrap">
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
                          <p className="text-sm font-medium">No compounds found. Try adjusting your filters.</p>
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
                            <button onClick={() => setHistoryModalItem(item)} className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all" title="View Modification History">
                              <History size={15} />
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
                  value={compoundMasterItemsPerPage.toString()}
                  onChange={(val) => setCompoundMasterItemsPerPage(Number(val))}
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
                  onClick={() => setCompoundMasterCurrentPage(Math.max(1, compoundMasterCurrentPage - 1))}
                  disabled={compoundMasterCurrentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: Math.min(5, totalPages || 1) }, (_, index) => {
                    let page;
                    if (totalPages <= 5) page = index + 1;
                    else if (compoundMasterCurrentPage <= 3) page = index + 1;
                    else if (compoundMasterCurrentPage >= totalPages - 2) page = totalPages - 4 + index;
                    else page = compoundMasterCurrentPage - 2 + index;

                    return (
                      <button
                        key={page}
                        onClick={() => setCompoundMasterCurrentPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${compoundMasterCurrentPage === page
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
                  onClick={() => setCompoundMasterCurrentPage(Math.min(totalPages, compoundMasterCurrentPage + 1))}
                  disabled={compoundMasterCurrentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{compoundMasterCurrentPage}</span> of{' '}
                <span className="text-slate-800">{totalPages || 1}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* History Modal triggered from table column/action button */}
      <RevisionHistoryModal
        isOpen={!!historyModalItem}
        onClose={() => setHistoryModalItem(null)}
        compoundId={historyModalItem?.id}
        compoundName={historyModalItem?.compoundName || historyModalItem?.compoundCode}
      />
    </div>
  );
}
