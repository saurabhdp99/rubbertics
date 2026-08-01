import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Edit, Trash2, Eye, X, Save, ArrowLeft,
  AlertCircle, ShieldCheck, FileSpreadsheet, Building2, Package, Search, ClipboardList, Factory, Clock
} from "lucide-react";
import { Input, Spinner, DatePicker, DateField, Calendar, Select, ListBox } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TableToolbar from "../components/common/TableToolbar";
import DataTable from "../components/common/DataTable";
import TableFooter from "../components/common/TableFooter";
import { useWorkOrderStore } from "../store/workOrderStore";
import { useAuthStore } from "../store/authStore";
import { useEmployeeMasterStore } from "../store/employeeMasterStore";
import { useToolsMasterStore } from "../store/toolsMasterStore";
import { useCompoundMasterStore } from "../store/compoundMasterStore";

const todayIsoDate = () => new Date().toISOString().split("T")[0];

const EMPTY_ENTRY = {
  // 1. WORK ORDER INFORMATION
  lot_no: "",
  wo_no: "",
  wo_date: todayIsoDate(),
  po_no: "",
  part_name: "",
  part_no: "",
  wo_qty: "",
  produced_qty: "",
  qty_balance_moulding: "",

  // 2. MATERIAL, MOULD & PROCESS DETAILS
  compound_code: "",
  raw_material: "",
  colour: "",
  no_of_cavities: "",
  mould_no: "",
  shot_weight: "",
  batch_weight: "",

  // 3. WORK ORDER REQUIREMENT & SHIFT PLANNING
  total_shots_req: "",
  total_rubber_req: "",
  batches_req: "",
  shift_target_pcs: "",
  shift_target_rm: "",
  total_shifts_req: "",

  // 4. PRODUCTION COMPLETION & MATERIAL RECONCILIATION
  accepted_qty: "",
  reject_qty: "",
  short_qty: "",
  wo_completion_percent: "",
  material_issued_mixing: "",
  material_consumed_moulding: "",
  material_balance_moulding_store: "",
  material_balance_mixing_plan: "",
  status: "",

  // 5. REMARKS / SPECIAL INSTRUCTIONS
  remarks: "",

  // 6. AUTHORIZATION
  prepared_by: "",
  prepared_date: todayIsoDate(),
  checked_by: "",
  checked_date: "",
  approved_by: "",
  approved_date: "",
};

const entrySchema = z.object({
  lot_no: z.string().optional(),
  wo_no: z.string().optional(),
  wo_date: z.string().optional(),
  po_no: z.string().optional(),
  part_name: z.string().optional(),
  part_no: z.string().optional(),
  wo_qty: z.string().optional(),
  produced_qty: z.string().optional(),
  qty_balance_moulding: z.string().optional(),

  compound_code: z.string().optional(),
  raw_material: z.string().optional(),
  colour: z.string().optional(),
  no_of_cavities: z.string().optional(),
  mould_no: z.string().optional(),
  shot_weight: z.string().optional(),
  batch_weight: z.string().optional(),

  total_shots_req: z.string().optional(),
  total_rubber_req: z.string().optional(),
  batches_req: z.string().optional(),
  shift_target_pcs: z.string().optional(),
  shift_target_rm: z.string().optional(),
  total_shifts_req: z.string().optional(),

  accepted_qty: z.string().optional(),
  reject_qty: z.string().optional(),
  short_qty: z.string().optional(),
  wo_completion_percent: z.string().optional(),
  material_issued_mixing: z.string().optional(),
  material_consumed_moulding: z.string().optional(),
  material_balance_moulding_store: z.string().optional(),
  material_balance_mixing_plan: z.string().optional(),
  status: z.string().optional(),

  remarks: z.string().optional(),

  prepared_by: z.string().optional(),
  prepared_date: z.string().optional(),
  checked_by: z.string().optional(),
  checked_date: z.string().optional(),
  approved_by: z.string().optional(),
  approved_date: z.string().optional(),
});

const baseInputClass = "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
const inputCls = `${baseInputClass} px-4 py-3 h-[46px]`;
const selectCls = `${baseInputClass} px-4 py-3 h-[46px]`;

function Section({ title, icon: Icon, children, subtitle }) {
  return (
    <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon size={15} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
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

function WorkOrderForm({ mode, entry, onBack }) {
  const { addEntry, updateEntry } = useWorkOrderStore();
  const { currentOrg, currentUser } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeMasterStore();
  const { tools, fetchTools } = useToolsMasterStore();
  const { compounds, fetchCompounds } = useCompoundMasterStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchEmployees(currentOrg.id);
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

    // Work Order Information
    const woQty = parseFloat(watchAll.wo_qty) || 0;
    const producedQty = parseFloat(watchAll.produced_qty) || 0;
    const qtyBalance = woQty - producedQty;
    if (watchAll.qty_balance_moulding !== qtyBalance.toString() && woQty > 0) {
      setValue("qty_balance_moulding", qtyBalance.toString());
    }

    // Work Order Requirement & Shift Planning
    const reqShots = parseFloat(watchAll.total_shots_req) || 0;
    const shotWeight = parseFloat(watchAll.shot_weight) || 0;
    const totalRubberReq = (reqShots * shotWeight).toFixed(2);
    if (watchAll.total_rubber_req !== totalRubberReq.toString() && reqShots > 0 && shotWeight > 0) {
      setValue("total_rubber_req", totalRubberReq.toString());
    }

    const batchWeight = parseFloat(watchAll.batch_weight) || 0;
    if (batchWeight > 0) {
        const batchesReq = (totalRubberReq / batchWeight).toFixed(2);
        if (watchAll.batches_req !== batchesReq.toString()) {
            setValue("batches_req", batchesReq.toString());
        }
    }

    const shiftTargetPcs = parseFloat(watchAll.shift_target_pcs) || 0;
    const noOfCavities = parseFloat(watchAll.no_of_cavities) || 0;
    if (shiftTargetPcs > 0 && shotWeight > 0 && noOfCavities > 0) {
        const shiftTargetRm = ((shiftTargetPcs / noOfCavities) * shotWeight).toFixed(2);
        if (watchAll.shift_target_rm !== shiftTargetRm.toString()) {
            setValue("shift_target_rm", shiftTargetRm.toString());
        }
    }

    if (shiftTargetPcs > 0 && woQty > 0) {
        const totalShiftsReq = (woQty / shiftTargetPcs).toFixed(2);
        if (watchAll.total_shifts_req !== totalShiftsReq.toString()) {
            setValue("total_shifts_req", totalShiftsReq.toString());
        }
    }

    // Production Completion & Material Reconciliation
    const acceptedQty = parseFloat(watchAll.accepted_qty) || 0;
    const rejectQty = parseFloat(watchAll.reject_qty) || 0;
    
    // produced Qty should equal accepted + reject but the user inputs produced_qty and accepted_qty, so we just calculate short Qty
    const expectedAcceptedQty = producedQty - rejectQty; // or they might fill it
    
    // Short Qty calculated against accepted quantity
    const shortQty = woQty - acceptedQty;
    if (watchAll.short_qty !== shortQty.toString() && woQty > 0) {
        setValue("short_qty", shortQty.toString());
    }

    const woCompletion = woQty > 0 ? ((acceptedQty / woQty) * 100).toFixed(2) : 0;
    if (watchAll.wo_completion_percent !== woCompletion.toString() && woQty > 0) {
        setValue("wo_completion_percent", woCompletion.toString());
    }
    
    const matIssued = parseFloat(watchAll.material_issued_mixing) || 0;
    const matConsumed = parseFloat(watchAll.material_consumed_moulding) || 0;
    
    const balMouldingStore = matIssued - matConsumed;
    if (watchAll.material_balance_moulding_store !== balMouldingStore.toString() && (matIssued > 0 || matConsumed > 0)) {
        setValue("material_balance_moulding_store", balMouldingStore.toString());
    }

    // Material Balance for mixing plan (Total Rubber required - Material Issued)
    const totalRubReqNum = parseFloat(watchAll.total_rubber_req) || 0;
    const balMixingPlan = totalRubReqNum - matIssued;
    if (watchAll.material_balance_mixing_plan !== balMixingPlan.toString() && (totalRubReqNum > 0 || matIssued > 0)) {
        setValue("material_balance_mixing_plan", balMixingPlan.toString());
    }


  }, [
    watchAll.wo_qty, watchAll.produced_qty, watchAll.total_shots_req, watchAll.shot_weight,
    watchAll.batch_weight, watchAll.shift_target_pcs, watchAll.no_of_cavities,
    watchAll.accepted_qty, watchAll.reject_qty, watchAll.material_issued_mixing,
    watchAll.material_consumed_moulding, watchAll.total_rubber_req, isView, setValue
  ]);

  const onSubmit = async (data) => {
    try {
      const numericFields = [
        "wo_qty", "produced_qty", "qty_balance_moulding", "no_of_cavities",
        "shot_weight", "batch_weight", "total_shots_req", "total_rubber_req",
        "batches_req", "shift_target_pcs", "shift_target_rm", "total_shifts_req",
        "accepted_qty", "reject_qty", "short_qty", "wo_completion_percent",
        "material_issued_mixing", "material_consumed_moulding", 
        "material_balance_moulding_store", "material_balance_mixing_plan"
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
              {isView ? <Eye size={24} className="text-emerald-600" /> : <ClipboardList size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Work Order' : mode === 'add' ? 'New Work Order' : 'Edit Work Order'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watchAll.wo_no ? `WO No: ${watchAll.wo_no}` : 'Fill the details below'}
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
                {mode === 'add' ? 'Create Work Order' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
        <form id="work-order-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-7">
            
            <Section title="1. WORK ORDER INFORMATION" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="lot_no" control={control} render={({ field }) => (
                  <Field label="Lot No." error={errors.lot_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Lot No." /></Field>
                )} />
                <Controller name="wo_no" control={control} render={({ field }) => (
                  <Field label="Work Order No." error={errors.wo_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter WO No." /></Field>
                )} />
                <Controller name="wo_date" control={control} render={({ field }) => (
                  <Field label="WO Date" error={errors.wo_date?.message}><CustomDatePicker field={field} isView={isView} label="WO Date" /></Field>
                )} />
                <Controller name="po_no" control={control} render={({ field }) => (
                  <Field label="PO No." error={errors.po_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter PO No." /></Field>
                )} />
                <Controller name="part_name" control={control} render={({ field }) => (
                  <Field label="Part Name" error={errors.part_name?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Part Name" /></Field>
                )} />
                <Controller name="part_no" control={control} render={({ field }) => (
                  <Field label="Part No." error={errors.part_no?.message}><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Part No." /></Field>
                )} />
                <Controller name="wo_qty" control={control} render={({ field }) => (
                  <Field label="Work Order Qty (pcs)" error={errors.wo_qty?.message}><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="produced_qty" control={control} render={({ field }) => (
                  <Field label="Produced Qty" error={errors.produced_qty?.message}><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="qty_balance_moulding" control={control} render={({ field }) => (
                  <Field label="Qty Balance for Moulding" error={errors.qty_balance_moulding?.message}><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
              </div>
            </Section>

            <Section title="2. MATERIAL, MOULD & PROCESS DETAILS" icon={Package} subtitle="Enter weight values in kilograms. Formula fields are calculated automatically.">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="compound_code" control={control} render={({ field }) => (
                  <Field label="Compound Code"><CustomSelect field={field} isView={isView} options={compoundOptions} placeholder="Select Compound" /></Field>
                )} />
                <Controller name="raw_material" control={control} render={({ field }) => (
                  <Field label="Raw Material"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Raw Material" /></Field>
                )} />
                <Controller name="colour" control={control} render={({ field }) => (
                  <Field label="Colour"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Colour" /></Field>
                )} />
                <Controller name="no_of_cavities" control={control} render={({ field }) => (
                  <Field label="No. of Cavities"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="mould_no" control={control} render={({ field }) => (
                  <Field label="Mould No."><CustomSelect field={field} isView={isView} options={toolOptions} placeholder="Select Mould" /></Field>
                )} />
                <Controller name="shot_weight" control={control} render={({ field }) => (
                  <Field label="Shot Weight (kg)"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="batch_weight" control={control} render={({ field }) => (
                  <Field label="Batch Weight (kg)"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
              </div>
            </Section>

            <Section title="3. WORK ORDER REQUIREMENT & SHIFT PLANNING" icon={Clock}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="total_shots_req" control={control} render={({ field }) => (
                  <Field label="Total Shots Required"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="total_rubber_req" control={control} render={({ field }) => (
                  <Field label="Total Rubber Required (kg)"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="batches_req" control={control} render={({ field }) => (
                  <Field label="Batches Required"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="shift_target_pcs" control={control} render={({ field }) => (
                  <Field label="Shift Target (pcs)"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="shift_target_rm" control={control} render={({ field }) => (
                  <Field label="Shift Target RM (kg)"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="total_shifts_req" control={control} render={({ field }) => (
                  <Field label="Total Shifts Required"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
              </div>
            </Section>

            <Section title="4. PRODUCTION COMPLETION & MATERIAL RECONCILIATION" icon={Factory} subtitle="Check: Produced Qty should normally equal Accepted Qty + Reject Qty. Short Qty is calculated against accepted quantity.">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Controller name="accepted_qty" control={control} render={({ field }) => (
                  <Field label="Accepted Qty"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="reject_qty" control={control} render={({ field }) => (
                  <Field label="Reject Qty"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="short_qty" control={control} render={({ field }) => (
                  <Field label="Short Qty"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="wo_completion_percent" control={control} render={({ field }) => (
                  <Field label="Work Order Completion (%)"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="material_issued_mixing" control={control} render={({ field }) => (
                  <Field label="Material Issued from Mixing (kg)"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="material_consumed_moulding" control={control} render={({ field }) => (
                  <Field label="Material Consumed in Moulding (kg)"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
                )} />
                <Controller name="material_balance_moulding_store" control={control} render={({ field }) => (
                  <Field label="Material Balance at Moulding Store (kg)"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="material_balance_mixing_plan" control={control} render={({ field }) => (
                  <Field label="Material Balance for Mixing Plan (kg)"><Input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800`} placeholder="Auto calculated" /></Field>
                )} />
                <Controller name="status" control={control} render={({ field }) => (
                  <Field label="Status"><CustomSelect field={field} isView={isView} options={["Pending", "In Progress", "Completed", "Cancelled"]} placeholder="Select Status" /></Field>
                )} />
              </div>
            </Section>

            <Section title="5. REMARKS / SPECIAL INSTRUCTIONS" icon={FileSpreadsheet}>
              <Controller name="remarks" control={control} render={({ field }) => (
                <Field label="Remarks" colClass="col-span-full">
                  <textarea {...field} disabled={isView} className={`${inputCls} px-4 py-3 min-h-[100px] resize-y`} placeholder="Enter any remarks or special instructions..." />
                </Field>
              )} />
            </Section>

            <Section title="6. AUTHORIZATION" icon={ShieldCheck}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Prepared By</h4>
                  <Controller name="prepared_by" control={control} render={({ field }) => (
                    <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                  )} />
                  <Controller name="prepared_date" control={control} render={({ field }) => (
                    <Field label="Date"><CustomDatePicker field={field} isView={isView} label="Date" /></Field>
                  )} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Checked By</h4>
                  <Controller name="checked_by" control={control} render={({ field }) => (
                    <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                  )} />
                  <Controller name="checked_date" control={control} render={({ field }) => (
                    <Field label="Date"><CustomDatePicker field={field} isView={isView} label="Date" /></Field>
                  )} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Approved By</h4>
                  <Controller name="approved_by" control={control} render={({ field }) => (
                    <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                  )} />
                  <Controller name="approved_date" control={control} render={({ field }) => (
                    <Field label="Date"><CustomDatePicker field={field} isView={isView} label="Date" /></Field>
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

export default function WorkOrderPage() {
  const { entries, isLoading, fetchEntries, isModalOpen, modalMode, setModalOpen, setModalMode, selectedEntry, setSelectedEntry, isDeleteConfirmOpen, setDeleteConfirmOpen, setEntryToDelete, entryToDelete, deleteEntry } = useWorkOrderStore();
  const { currentOrg } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentOrg?.id) fetchEntries(currentOrg.id);
  }, [currentOrg, fetchEntries]);

  const filteredEntries = entries.filter((e) =>
    Object.values(e).some((val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { accessor: "wo_date", header: "WO Date", render: (val) => val ? new Date(val).toLocaleDateString() : "-" },
    { accessor: "wo_no", header: "WO No." },
    { accessor: "part_name", header: "Part Name" },
    { accessor: "wo_qty", header: "WO Qty" },
    { accessor: "wo_completion_percent", header: "Completion %", render: (val) => val ? `${val}%` : "-" },
    { accessor: "status", header: "Status" },
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Work Orders</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 sm:mt-1.5">Manage and track work order details and planning</p>
          </div>
        </div>
      )}

      {isModalOpen ? (
        <WorkOrderForm mode={modalMode} entry={selectedEntry} onBack={() => { setModalOpen(false); setSelectedEntry(null); }} />
      ) : (
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col pb-4 mt-2">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search work orders..."
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
                <p className="text-sm mt-1">Try adjusting your search or add a new work order.</p>
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
                  <h3 className="text-lg font-bold text-slate-900">Delete Work Order</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to delete this work order? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={async () => { await deleteEntry(entryToDelete?.id); setDeleteConfirmOpen(false); setEntryToDelete(null); }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                  Delete Work Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
