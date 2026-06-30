import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ContactRound,
  Edit,
  Eye,
  FileDown,
  Hash,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  X,
  Users
} from 'lucide-react';
import { Table, Input, Select, Label, ListBox, DatePicker, DateField, Calendar, Spinner } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StatsCard from '../components/common/StatsCard';
import EditableCreatableSelect from '../components/common/EditableCreatableSelect';
import { EMPLOYEE_MASTER_FIELDS, EMPLOYEE_MASTER_SECTIONS } from '../data/employeeMasterTemplate';
import { useEmployeeMasterStore } from '../store/employeeMasterStore';
import { useAuthStore } from '../store/authStore';


const todayIsoDate = () => new Date().toISOString().split('T')[0];

const EMPTY_EMPLOYEE = EMPLOYEE_MASTER_FIELDS.reduce((emp, field) => {
  if (field.type === 'creatable-select' || field.type === 'select') emp[field.key] = field.options?.[0] || '';
  else if (field.type === 'checkbox' || field.type === 'switch') emp[field.key] = false;
  else emp[field.key] = '';
  return emp;
}, {});

const createInitialEmployeeForm = (employee) => {
  if (employee) return { ...EMPTY_EMPLOYEE, ...employee };
  return {
    ...EMPTY_EMPLOYEE,
    employeeCode: 'Auto generated on create', // Will be overridden on submit
  };
};

const TABLE_COLUMNS = EMPLOYEE_MASTER_FIELDS
  .filter(field => ['employeeCode', 'employeeName', 'department', 'designation', 'mobileNo', 'netSalary', 'bankName', 'skillCategory'].includes(field.key))
  .map(field => ({
    ...field,
    width: field.wide ? '260px' : field.type === 'date' ? '150px' : field.type === 'select' ? '160px' : '190px',
    align: ['employeeCode'].includes(field.key) ? 'center' : 'left',
  }));

const employeeMasterSchema = z.object({
  employeeCode: z.string().optional(),
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeType: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  mobileNo: z.string().optional(),
  alternateMobile: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  currentAddressLine1: z.string().optional(),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().optional(),
  currentDistrict: z.string().optional(),
  currentState: z.string().optional(),
  currentPincode: z.string().optional(),
  currentCountry: z.string().optional(),
  sameAsCurrentAddress: z.boolean().optional(),
  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentState: z.string().optional(),
  permanentPincode: z.string().optional(),
  permanentCountry: z.string().optional(),
  addressRemarks: z.string().optional(),
  panNo: z.string().optional(),
  aadhaarNo: z.string().optional(),
  uanNo: z.string().optional(),
  pfNo: z.string().optional(),
  esiNo: z.string().optional(),
  professionalTaxNo: z.string().optional(),
  pfApplicable: z.boolean().optional(),
  esiApplicable: z.boolean().optional(),
  statutoryRemarks: z.string().optional(),
  salaryType: z.string().optional(),
  basicSalary: z.coerce.number().optional().or(z.literal('')),
  hra: z.coerce.number().optional().or(z.literal('')),
  conveyance: z.coerce.number().optional().or(z.literal('')),
  otherAllowance: z.coerce.number().optional().or(z.literal('')),
  grossSalary: z.coerce.number().optional().or(z.literal('')),
  pfDeduction: z.coerce.number().optional().or(z.literal('')),
  esiDeduction: z.coerce.number().optional().or(z.literal('')),
  otherDeduction: z.coerce.number().optional().or(z.literal('')),
  netSalary: z.coerce.number().optional().or(z.literal('')),
  effectiveFrom: z.string().optional(),
  salaryRemarks: z.string().optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
  paymentMode: z.string().optional(),
  upiId: z.string().optional(),
  bankRemarks: z.string().optional(),
  skillCategory: z.string().optional(),
  skillLevel: z.string().optional(),
  skillRemarks: z.string().optional()
});

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
  const baseInputClass = `w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none ${error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-emerald-500/50'
    } input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`;
  const inputClass = `${baseInputClass} px-4 py-3`;
  const isLocked = disabled || field.autoGenerated;
  const selectOptions = options || field.options || [];

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
          if (field.type === 'creatable-select' || field.type === 'select') {
            return (
              <EditableCreatableSelect
                value={value || selectOptions[0] || ''}
                options={selectOptions}
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
          if (field.type === 'checkbox' || field.type === 'switch') {
            return (
              <div className="flex items-center h-[46px] px-2">
                <input
                  type="checkbox"
                  checked={!!value}
                  disabled={isLocked}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  ref={ref}
                />
                <span className="ml-3 text-sm font-medium text-slate-700">{field.label}</span>
              </div>
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
              placeholder={field.autoGenerated ? 'Auto generated on create' : field.placeholder || field.label}
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

function EmployeeMasterForm({ mode, employee, onBack }) {
  const {
    employees: employeeMasterItems,
    addEmployee: addEmployeeMaster,
    updateEmployee: updateEmployeeMaster,
    deleteEmployee: deleteEmployeeMaster,
    lookups: employeeMasterLookups,
    addLookupOption: addEmployeeMasterLookupOption,
    renameLookupOption: renameEmployeeMasterLookupOption,
    deleteLookupOption: deleteEmployeeMasterLookupOption,
  } = useEmployeeMasterStore();
  const { currentOrg, currentUser } = useAuthStore();

  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const { control, handleSubmit: hookFormSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(employeeMasterSchema),
    defaultValues: createInitialEmployeeForm(employee)
  });

  useEffect(() => {
    reset(createInitialEmployeeForm(employee));
  }, [employee, mode, reset]);

  const sameAsCurrentAddress = watch('sameAsCurrentAddress');
  const currentAddress = watch([
    'currentAddressLine1',
    'currentAddressLine2',
    'currentCity',
    'currentDistrict',
    'currentState',
    'currentPincode',
    'currentCountry'
  ]);

  useEffect(() => {
    if (sameAsCurrentAddress) {
      setValue('permanentAddressLine1', currentAddress[0] || '');
      setValue('permanentAddressLine2', currentAddress[1] || '');
      setValue('permanentCity', currentAddress[2] || '');
      setValue('permanentDistrict', currentAddress[3] || '');
      setValue('permanentState', currentAddress[4] || '');
      setValue('permanentPincode', currentAddress[5] || '');
      setValue('permanentCountry', currentAddress[6] || '');
    }
  }, [sameAsCurrentAddress, ...currentAddress, setValue]);

  const groupedFields = EMPLOYEE_MASTER_SECTIONS.map(section => ({
    section,
    fields: EMPLOYEE_MASTER_FIELDS.filter(field => field.section === section),
  }));

  const onSubmit = async (data) => {
    const finalForm = { ...data };
    if (isAdd) {
      // Auto generate employee code based on max id
      const maxId = employeeMasterItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
      finalForm.employeeCode = `EMP${String(maxId + 1).padStart(4, '0')}`;
      await addEmployeeMaster(finalForm, currentOrg?.id, currentUser?.id);
    } else {
      await updateEmployeeMaster(employee.id, finalForm, currentUser?.id);
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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Users size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Employee' : isAdd ? 'Add Employee' : 'Edit Employee'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {isAdd ? 'Employee code will be generated automatically' : watch('employeeCode')}
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
                form="employee-master-page-form"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {isAdd ? 'Create Employee' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <form id="employee-master-page-form" onSubmit={hookFormSubmit(onSubmit)} className="p-6">
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
                      disabled={isView || isSubmitting || (sameAsCurrentAddress && field.key.startsWith('permanent'))}
                      error={errors[field.key]?.message}
                      options={employeeMasterLookups[field.key] || field.options}
                      onAddOption={(newOption) => addEmployeeMasterLookupOption(field.key, newOption)}
                      onRenameOption={(oldOption, newOption) => renameEmployeeMasterLookupOption(field.key, oldOption, newOption)}
                      onDeleteOption={(option) => deleteEmployeeMasterLookupOption(field.key, option)}
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
                      if (window.confirm(`Are you sure you want to delete employee "${employee?.employeeName || ''}"? This action cannot be undone.`)) {
                        const success = await deleteEmployeeMaster(employee.id);
                        if (success) onBack();
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete Employee
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
                  {isAdd ? 'Create Employee' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function EmployeeMasterPage() {
  const {
    employees: employeeMasterItems,
    searchQuery: employeeMasterSearchQuery,
    departmentFilter: employeeMasterDepartmentFilter,
    currentPage: employeeMasterCurrentPage,
    itemsPerPage: employeeMasterItemsPerPage,
    setSearchQuery: setEmployeeMasterSearchQuery,
    setDepartmentFilter: setEmployeeMasterDepartmentFilter,
    setCurrentPage: setEmployeeMasterCurrentPage,
    setItemsPerPage: setEmployeeMasterItemsPerPage,
    deleteEmployee: deleteEmployeeMaster,
    getFilteredEmployees: getFilteredEmployeeMasterItems,
    getStats: getEmployeeMasterStats,
    fetchEmployees, isLoading,
  } = useEmployeeMasterStore();
  const { currentOrg } = useAuthStore();

  useEffect(() => {
    if (currentOrg?.id) fetchEmployees(currentOrg.id);
  }, [currentOrg?.id]);

  
  const [viewState, setViewState] = useState({ type: 'table', mode: null, employee: null });
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);

  const filtered = getFilteredEmployeeMasterItems();
  const stats = getEmployeeMasterStats();
  const totalPages = Math.ceil(filtered.length / employeeMasterItemsPerPage);
  const pagedEmployees = filtered.slice(
    (employeeMasterCurrentPage - 1) * employeeMasterItemsPerPage,
    employeeMasterCurrentPage * employeeMasterItemsPerPage
  );

  const departments = useMemo(() => {
    return ['All', ...Array.from(new Set(employeeMasterItems.map(emp => emp.department).filter(Boolean))).sort()];
  }, [employeeMasterItems]);

  const openForm = (mode, employee = null) => {
    setDeleteCandidateId(null);
    setViewState({ type: 'form', mode, employee });
  };

  const backToTable = () => setViewState({ type: 'table', mode: null, employee: null });

  const clearFilters = () => {
    setEmployeeMasterSearchQuery('');
    setEmployeeMasterDepartmentFilter('All');
  };

  const exportCsv = () => {
    const headers = EMPLOYEE_MASTER_FIELDS.map(field => field.label);
    const rows = filtered.map(emp => EMPLOYEE_MASTER_FIELDS.map(field => String(emp[field.key] ?? '').replaceAll('"', '""')));
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (employee, column) => {
    const value = employee[column.key];

    if (column.key === 'employeeCode') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
          <Hash size={12} /> {value || '-'}
        </span>
      );
    }

    if (column.key === 'employeeName') {
      return <span className="font-bold text-slate-800 line-clamp-2" title={value}>{value || '-'}</span>;
    }

    if (column.key.toLowerCase().includes('email')) {
      return value ? (
        <span className="inline-flex items-center gap-1.5 max-w-[220px] truncate text-indigo-700" title={value}>
          <Mail size={12} /> {value}
        </span>
      ) : '-';
    }

    if (column.key.toLowerCase().includes('mobile') || column.key.toLowerCase().includes('phone')) {
      return value ? (
        <span className="inline-flex items-center gap-1.5 text-slate-700 whitespace-nowrap" title={value}>
          <Phone size={12} /> {value}
        </span>
      ) : '-';
    }

    if (column.type === 'select' || column.type === 'creatable-select') {
      return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
          {value || '-'}
        </span>
      );
    }

    if (column.type === 'date') {
      return <span className="font-semibold text-slate-700 whitespace-nowrap">{value || '-'}</span>;
    }
    
    if (column.type === 'checkbox' || column.type === 'switch') {
       return <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${value ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{value ? 'Yes' : 'No'}</span>
    }

    return <span className="block max-w-[240px] truncate" title={value}>{value || '-'}</span>;
  };

  return (
    <div className="p-3 max-w-[1920px] mx-auto animate-slide-up">
      {viewState.type !== 'form' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Total Employees" value={stats.total.toLocaleString()} icon={Users} color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.25)" animationDelay={0} />
          <StatsCard label="Departments" value={stats.departments.toLocaleString()} icon={Building2} color="#6366f1" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.25)" animationDelay={50} />
          <StatsCard label="Permanent" value={stats.permanent.toLocaleString()} icon={BriefcaseBusiness} color="#f59e0b" bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.25)" animationDelay={100} />
          <StatsCard label="Contract" value={stats.contract.toLocaleString()} icon={ContactRound} color="#ef4444" bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.25)" animationDelay={150} />
        </div>
      )}


      {viewState.type === 'form' ? (
        <EmployeeMasterForm
          key={`${viewState.mode}-${viewState.employee?.id || 'new'}`}
          mode={viewState.mode}
          employee={viewState.employee}
          onBack={backToTable}
        />
      ) : (
        <>
          <div className="glass-card rounded-2xl p-5 shadow-xl mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full min-w-0 group">

                <Input
                  type="text"
                  placeholder="Search by code, name, designation, mobile..."
                  value={employeeMasterSearchQuery}
                  onChange={event => setEmployeeMasterSearchQuery(event.target.value)}
                  aria-label="Search employees"
                  className="w-full pl-11 pr-4 py-3 h-auto min-h-[46px] text-sm input-glow rounded-xl focus-within:border-emerald-500/50 bg-white border border-slate-200"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <Select
                  value={employeeMasterDepartmentFilter}
                  onChange={(val) => setEmployeeMasterDepartmentFilter(val)}
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
              </div>

              <div className="flex gap-3 w-full xl:w-auto shrink-0">
                <button onClick={exportCsv} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all flex-1 xl:flex-none">
                  <FileDown size={18} />
                  Export
                </button>
                <button onClick={() => openForm('add')} className="btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 flex-1 xl:flex-none">
                  <Plus size={18} strokeWidth={2.5} />
                  Add Employee
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{employeeMasterItems.length}</span> employees
              </p>
              {(employeeMasterSearchQuery || employeeMasterDepartmentFilter !== 'All') && (
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
                  aria-label="Employee master table"
                  className="text-left"
                  style={{ minWidth: `${TABLE_COLUMNS.length * 175 + 150}px` }}
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
                  <Table.Body items={pagedEmployees} loadingState={isLoading ? 'loading' : 'idle'} loadingContent={<Spinner size="lg" color="primary" />} renderEmptyState={() => (
                    isLoading ? null : (
                      <div className="py-24 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                            <SlidersHorizontal size={32} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-medium">No employees found. Try adjusting your filters.</p>
                        </div>
                      </div>
                    )
                  )}>
                    {(employee) => (
                      <Table.Row key={employee.id} className="group">
                        <Table.Cell>
                            <div className="flex items-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                              <button onClick={() => openForm('view', employee)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all" title="View">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => openForm('edit', employee)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all" title="Edit">
                                <Edit size={15} />
                              </button>
                            </div>
                        </Table.Cell>
                        {TABLE_COLUMNS.map(column => (
                          <Table.Cell key={column.key} className="text-[13px] text-slate-700" style={{ textAlign: column.align || 'left' }}>
                            {renderCellValue(employee, column)}
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
                  value={employeeMasterItemsPerPage.toString()}
                  onChange={(val) => setEmployeeMasterItemsPerPage(Number(val))}
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
                  onClick={() => setEmployeeMasterCurrentPage(Math.max(1, employeeMasterCurrentPage - 1))}
                  disabled={employeeMasterCurrentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: Math.min(5, totalPages || 1) }, (_, index) => {
                    let page;
                    if (totalPages <= 5) page = index + 1;
                    else if (employeeMasterCurrentPage <= 3) page = index + 1;
                    else if (employeeMasterCurrentPage >= totalPages - 2) page = totalPages - 4 + index;
                    else page = employeeMasterCurrentPage - 2 + index;

                    return (
                      <button
                        key={page}
                        onClick={() => setEmployeeMasterCurrentPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${employeeMasterCurrentPage === page
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
                  onClick={() => setEmployeeMasterCurrentPage(Math.min(totalPages, employeeMasterCurrentPage + 1))}
                  disabled={employeeMasterCurrentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
