import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Edit, Trash2, Eye, X, Save, ArrowLeft, SlidersHorizontal,
  AlertCircle, ShieldCheck, FileSpreadsheet, Building2, Package, Search, Factory
} from "lucide-react";
import { Input, Spinner, DatePicker, DateField, Calendar, Select, ListBox } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TableToolbar from "../components/common/TableToolbar";
import DataTable from "../components/common/DataTable";
import TableFooter from "../components/common/TableFooter";
import { useMouldingProductionStore } from "../store/mouldingProductionStore";
import { useAuthStore } from "../store/authStore";
import { useEmployeeMasterStore } from "../store/employeeMasterStore";
import { useMachineMasterStore } from "../store/machineMasterStore";
import { useToolsMasterStore } from "../store/toolsMasterStore";
import { useCompoundMasterStore } from "../store/compoundMasterStore";

const todayIsoDate = () => new Date().toISOString().split("T")[0];

const EMPTY_ENTRY = {
  production_date: todayIsoDate(),
  moulder_name: "",
  shift: "",
  route_card_no: "",
  lot_no: "",
  batch_no: "",

  part_name: "",
  die_number: "",
  cavity: "",
  machine_no: "",
  compound_name: "",
  target: "",

  given_material: "",
  return_material: "",
  consume_material: "",
  material_weight: "",
  flash: "",
  short_weight_g: "",
  actual_short: "",
  actual_short_weight: "",
  rejection: "",

  per_shift_target: "",
  actual_shift_production: "",
  accepted_quantity: "",
  short_quantity: "",
  actual_rejection_qty: "",
  target_percentage: "",
  moulding_rejection_percentage: "",

  comments: "",

  moulder_operator_status: "",
  moulder_operator_name: "",
  shift_supervisor_status: "",
  shift_supervisor_name: "",
  quality_ppc_status: "",
  quality_ppc_name: "",
};

const entrySchema = z.object({
  production_date: z.string().optional(),
  moulder_name: z.string().optional(),
  shift: z.string().optional(),
  route_card_no: z.string().optional(),
  lot_no: z.string().optional(),
  batch_no: z.string().optional(),
  part_name: z.string().optional(),
  die_number: z.string().optional(),
  cavity: z.string().optional(),
  machine_no: z.string().optional(),
  compound_name: z.string().optional(),
  target: z.string().optional(),
  given_material: z.string().optional(),
  return_material: z.string().optional(),
  consume_material: z.string().optional(),
  material_weight: z.string().optional(),
  flash: z.string().optional(),
  short_weight_g: z.string().optional(),
  actual_short: z.string().optional(),
  actual_short_weight: z.string().optional(),
  rejection: z.string().optional(),
  per_shift_target: z.string().optional(),
  actual_shift_production: z.string().optional(),
  accepted_quantity: z.string().optional(),
  short_quantity: z.string().optional(),
  actual_rejection_qty: z.string().optional(),
  target_percentage: z.string().optional(),
  moulding_rejection_percentage: z.string().optional(),
  comments: z.string().optional(),
  moulder_operator_status: z.string().optional(),
  moulder_operator_name: z.string().optional(),
  shift_supervisor_status: z.string().optional(),
  shift_supervisor_name: z.string().optional(),
  quality_ppc_status: z.string().optional(),
  quality_ppc_name: z.string().optional(),
});

const baseInputClass = "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
const inputCls = `${baseInputClass} px-4 py-3 h-[46px]`;
const selectCls = `${baseInputClass} px-4 py-3 h-[46px]`;

function Section({ title, icon: Icon, children }) {
  return (
    <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon size={15} className="text-emerald-600" />
        </div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, required, error, colClass = "col-span-1" }) {
  return (
    <label className={`flex flex-col gap-2 relative ${colClass}`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </label>
  );
}

function CustomDatePicker({ field, isView, label }) {
  const dateValue = field.value && typeof field.value === "string" ? field.value.split("T")[0] : "";
  return (
    <DatePicker
      value={dateValue ? parseDate(dateValue) : null}
      isDisabled={isView}
      onChange={(dateVal) => field.onChange(dateVal ? dateVal.toString() : "")}
      className="w-full"
      aria-label={label}
    >
      <DateField.Group className={`${baseInputClass} flex items-center overflow-hidden h-[46px]`} fullWidth>
        <DateField.Input className="flex-1 py-1 px-4 text-[13px] outline-none bg-transparent">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="pr-2">
          <DatePicker.Trigger className="text-slate-500 hover:text-emerald-600 transition-colors">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>{({ year }) => <Calendar.YearPickerCell year={year} />}</Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

function CustomSelect({ field, isView, options, placeholder = "Select..." }) {
  const normalizedOptions = options.map((opt) => typeof opt === "string" ? { id: opt, textValue: opt } : { id: opt.value, textValue: opt.label });
  return (
    <Select
      isDisabled={isView}
      value={field.value || ""}
      onChange={(val) => field.onChange(val || "")}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full"
    >
      <Select.Trigger className={`w-full h-[46px] px-4 text-[13px] ${baseInputClass} font-medium text-slate-800 focus-within:border-emerald-500/50 flex items-center justify-between`}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {normalizedOptions.map((opt) => (
            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.textValue}>
              {opt.textValue}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function MouldingProductionForm({ mode, entry, onBack }) {
  const { addEntry, updateEntry, entries } = useMouldingProductionStore();
  const { currentOrg, currentUser } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeMasterStore();
  const { machines, fetchMachines } = useMachineMasterStore();
  const { tools, fetchTools } = useToolsMasterStore();
  const { compounds, fetchCompounds } = useCompoundMasterStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchEmployees(currentOrg.id);
      fetchMachines(currentOrg.id);
      fetchTools(currentOrg.id);
      fetchCompounds(currentOrg.id);
    }
  }, [currentOrg]);

  const isView = mode === "view";

  const getInitialValues = () => {
    if (!entry) return EMPTY_ENTRY;
    const sanitized = { ...entry };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === null) {
        sanitized[key] = "";
      } else if (typeof sanitized[key] === "number") {
        sanitized[key] = sanitized[key].toString();
      }
    });
    return sanitized;
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: getInitialValues(),
  });

  const watchAll = watch();

  // Auto Calculations
  useEffect(() => {
    if (isView) return;

    // Material Details Calculation
    const given = parseFloat(watchAll.given_material) || 0;
    const returned = parseFloat(watchAll.return_material) || 0;
    const consume = given - returned;
    if (watchAll.consume_material !== consume.toString() && (given > 0 || returned > 0)) {
      setValue("consume_material", consume.toString());
    }

    const actualShort = parseFloat(watchAll.actual_short) || 0;
    const shortWeightG = parseFloat(watchAll.short_weight_g) || 0;
    const actualShortWeight = (actualShort * shortWeightG) / 1000; // Assuming g to kg conversion if needed, adjust logic as per real world
    if (watchAll.actual_short_weight !== actualShortWeight.toString() && actualShort > 0) {
      setValue("actual_short_weight", actualShortWeight.toString());
    }

    // Production Details Calculation
    const actualProd = parseFloat(watchAll.actual_shift_production) || 0;
    const actualRejection = parseFloat(watchAll.actual_rejection_qty) || 0;

    const acceptedQty = actualProd - actualRejection;
    if (watchAll.accepted_quantity !== acceptedQty.toString() && actualProd > 0) {
      setValue("accepted_quantity", acceptedQty.toString());
    }

    const perShiftTarget = parseFloat(watchAll.per_shift_target) || 0;
    const shortQty = perShiftTarget - actualProd;
    if (watchAll.short_quantity !== shortQty.toString() && perShiftTarget > 0) {
      setValue("short_quantity", shortQty.toString());
    }

    const targetPercentage = perShiftTarget > 0 ? ((actualProd / perShiftTarget) * 100).toFixed(2) : 0;
    if (watchAll.target_percentage !== targetPercentage.toString() && perShiftTarget > 0) {
      setValue("target_percentage", targetPercentage.toString());
    }

    const mouldingRejPerc = actualProd > 0 ? ((actualRejection / actualProd) * 100).toFixed(2) : 0;
    if (watchAll.moulding_rejection_percentage !== mouldingRejPerc.toString() && actualProd > 0) {
      setValue("moulding_rejection_percentage", mouldingRejPerc.toString());
    }
  }, [
    watchAll.given_material, watchAll.return_material, watchAll.actual_short, watchAll.short_weight_g,
    watchAll.actual_shift_production, watchAll.actual_rejection_qty, watchAll.per_shift_target, isView, setValue
  ]);

  const onSubmit = async (data) => {
    try {
      const numericFields = [
        "target", "given_material", "return_material", "consume_material",
        "material_weight", "flash", "short_weight_g", "actual_short",
        "actual_short_weight", "rejection", "per_shift_target",
        "actual_shift_production", "accepted_quantity", "short_quantity",
        "actual_rejection_qty", "target_percentage", "moulding_rejection_percentage"
      ];

      const payload = { ...data };
      numericFields.forEach(field => {
        if (payload[field] === "") {
          payload[field] = null;
        } else if (payload[field] !== null && payload[field] !== undefined) {
          payload[field] = parseFloat(payload[field]);
        }
      });

      if (mode === "add") {
        await addEntry(payload, currentOrg.id, currentUser.id);
      } else if (mode === "edit") {
        await updateEntry(entry.id, payload);
      }
      onBack();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const employeeOptions = Array.from(new Set(employees.map(e => e.employeeName).filter(Boolean)));
  const machineOptions = Array.from(new Set(machines.map(m => m.machineName).filter(Boolean)));
  const toolOptions = Array.from(new Set(tools.map(t => t.toolCode).filter(Boolean)));
  const compoundOptions = Array.from(new Set(compounds.map(c => c.name).filter(Boolean)));

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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Factory size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Moulding Production' : mode === 'add' ? 'New Moulding Production Entry' : 'Edit Moulding Production Entry'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watchAll.route_card_no ? `Route Card: ${watchAll.route_card_no}` : 'Fill the details below'}
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
                onClick={handleSubmit(onSubmit)}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
              >
                <Save size={16} />
                {mode === 'add' ? 'Create Entry' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
        <form id="moulding-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-7">
            <Section title="1. GENERAL INFORMATION" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="production_date" control={control} render={({ field }) => (
                  <Field label="Date" error={errors.production_date?.message}><CustomDatePicker field={field} isView={isView} label="Date" /></Field>
                )} />
                <Controller name="moulder_name" control={control} render={({ field }) => (
                  <Field label="Moulder Name" error={errors.moulder_name?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter name" /></Field>
                )} />
                <Controller name="shift" control={control} render={({ field }) => (
                  <Field label="Shift (Day/Night)" error={errors.shift?.message}><CustomSelect field={field} isView={isView} options={["Day", "Night"]} placeholder="Select Shift" /></Field>
                )} />
                <Controller name="route_card_no" control={control} render={({ field }) => (
                  <Field label="Route Card No." error={errors.route_card_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Route Card No." /></Field>
                )} />
                <Controller name="lot_no" control={control} render={({ field }) => (
                  <Field label="Lot No." error={errors.lot_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Lot No." /></Field>
                )} />
                <Controller name="batch_no" control={control} render={({ field }) => (
                  <Field label="Batch No." error={errors.batch_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Batch No." /></Field>
                )} />
              </div>
            </Section>

            <Section title="2. PART, TOOL & MACHINE DETAILS" icon={Package}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="part_name" control={control} render={({ field }) => (
                  <Field label="Part Name"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Part Name" /></Field>
                )} />
                <Controller name="die_number" control={control} render={({ field }) => (
                  <Field label="Die Number"><CustomSelect field={field} isView={isView} options={toolOptions} placeholder="Select Die" /></Field>
                )} />
                <Controller name="cavity" control={control} render={({ field }) => (
                  <Field label="Cavity"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Cavity" /></Field>
                )} />
                <Controller name="machine_no" control={control} render={({ field }) => (
                  <Field label="Machine No. (MC No.)"><CustomSelect field={field} isView={isView} options={machineOptions} placeholder="Select Machine" /></Field>
                )} />
                <Controller name="compound_name" control={control} render={({ field }) => (
                  <Field label="Compound Name"><CustomSelect field={field} isView={isView} options={compoundOptions} placeholder="Select Compound" /></Field>
                )} />
                <Controller name="target" control={control} render={({ field }) => (
                  <Field label="Target"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Target" /></Field>
                )} />
              </div>
            </Section>

            <Section title="3. MATERIAL DETAILS" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="given_material" control={control} render={({ field }) => (
                  <Field label="Given"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="return_material" control={control} render={({ field }) => (
                  <Field label="Return"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="consume_material" control={control} render={({ field }) => (
                  <Field label="Consume"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="material_weight" control={control} render={({ field }) => (
                  <Field label="Material Weight"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="flash" control={control} render={({ field }) => (
                  <Field label="Flash"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="short_weight_g" control={control} render={({ field }) => (
                  <Field label="Short Weight (g)"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="actual_short" control={control} render={({ field }) => (
                  <Field label="Actual Short"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="actual_short_weight" control={control} render={({ field }) => (
                  <Field label="Actual Short Weight"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="rejection" control={control} render={({ field }) => (
                  <Field label="Rejection"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
              </div>
            </Section>

            <Section title="4. PRODUCTION & REJECTION DETAILS" icon={Factory}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="per_shift_target" control={control} render={({ field }) => (
                  <Field label="Per Shift Target Production"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="actual_shift_production" control={control} render={({ field }) => (
                  <Field label="Actual Shift Production"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="accepted_quantity" control={control} render={({ field }) => (
                  <Field label="Accepted Quantity"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="short_quantity" control={control} render={({ field }) => (
                  <Field label="Short Quantity"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="actual_rejection_qty" control={control} render={({ field }) => (
                  <Field label="Actual Rejection Qty"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="target_percentage" control={control} render={({ field }) => (
                  <Field label="Target %"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="moulding_rejection_percentage" control={control} render={({ field }) => (
                  <Field label="Moulding Rejection %"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500 italic">Percentages and quantities are auto-calculated from production data.</p>
              </div>
            </Section>

            <Section title="5. COMMENTS / OBSERVATIONS" icon={FileSpreadsheet}>
              <Controller name="comments" control={control} render={({ field }) => (
                <Field label="Comments" colClass="col-span-full">
                  <textarea {...field} disabled={isView} className={`${inputCls} px-4 py-3 min-h-[100px] resize-y`} placeholder="Enter any comments or observations..." />
                </Field>
              )} />
            </Section>

            <Section title="6. VERIFICATION" icon={ShieldCheck}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Moulder / Operator</h4>
                  <Controller name="moulder_operator_status" control={control} render={({ field }) => (
                    <Field label="Status"><CustomSelect field={field} isView={isView} options={["Approved", "Reject", "Hold"]} /></Field>
                  )} />
                  <Controller name="moulder_operator_name" control={control} render={({ field }) => (
                    <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                  )} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Shift Supervisor</h4>
                  <Controller name="shift_supervisor_status" control={control} render={({ field }) => (
                    <Field label="Status"><CustomSelect field={field} isView={isView} options={["Approved", "Reject", "Hold"]} /></Field>
                  )} />
                  <Controller name="shift_supervisor_name" control={control} render={({ field }) => (
                    <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                  )} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Quality / PPC</h4>
                  <Controller name="quality_ppc_status" control={control} render={({ field }) => (
                    <Field label="Status"><CustomSelect field={field} isView={isView} options={["Approved", "Reject", "Hold"]} /></Field>
                  )} />
                  <Controller name="quality_ppc_name" control={control} render={({ field }) => (
                    <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                  )} />
                </div>
              </div>
            </Section>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MouldingProductionPage() {
  const { entries, isLoading, fetchEntries, isModalOpen, modalMode, setModalOpen, setModalMode, selectedEntry, setSelectedEntry, isDeleteConfirmOpen, setDeleteConfirmOpen, setEntryToDelete, entryToDelete, deleteEntry } = useMouldingProductionStore();
  const { currentOrg } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentOrg?.id) fetchEntries(currentOrg.id);
  }, [currentOrg, fetchEntries]);

  const filteredEntries = entries.filter((e) =>
    Object.values(e).some((val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { accessor: "production_date", header: "Date", render: (val) => val ? new Date(val).toLocaleDateString() : "-" },
    { accessor: "shift", header: "Shift" },
    { accessor: "part_name", header: "Part Name" },
    { accessor: "machine_no", header: "Machine No." },
    { accessor: "moulder_name", header: "Moulder" },
    { accessor: "actual_shift_production", header: "Actual Prod." },
    { accessor: "target_percentage", header: "Target %", render: (val) => val ? `${val}%` : "-" },
    {
      accessor: "actions",
      header: "Actions",
      align: "right",
      render: (_, entry) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => { setSelectedEntry(entry); setModalMode("view"); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View">
            <Eye size={16} />
          </button>
          <button onClick={() => { setSelectedEntry(entry); setModalMode("edit"); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => { setEntryToDelete(entry); setDeleteConfirmOpen(true); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-[1600px] mx-auto min-h-screen">
      {!isModalOpen && (
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Moulding Production</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 sm:mt-1.5">Manage and track moulding production details</p>
          </div>
        </div>
      )}

      {isModalOpen ? (
        <MouldingProductionForm mode={modalMode} entry={selectedEntry} onBack={() => { setModalOpen(false); setSelectedEntry(null); }} />
      ) : (
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col pb-4 mt-2">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search production entries..."
            onAdd={() => { setSelectedEntry(null); setModalMode("add"); setModalOpen(true); }}
            onExport={() => { }}
          />

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Spinner size="lg" color="success" />
                <p className="mt-4 text-sm font-medium">Loading entries...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-base font-semibold text-slate-600">No entries found</p>
                <p className="text-sm mt-1">Try adjusting your search or add a new entry.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredEntries} keyField="id" />
            )}
          </div>

          <TableFooter totalItems={filteredEntries.length} itemName="entries" />
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Entry</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to delete this entry? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={async () => { await deleteEntry(entryToDelete?.id); setDeleteConfirmOpen(false); setEntryToDelete(null); }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                  Delete Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
